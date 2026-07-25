// src/services/dam.service.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { storageProvider } from './storage/storage.adapter';
import { CONFIGURED_FOLDERS } from '../config/folders';
import imageSize from 'image-size';

const prisma = new PrismaClient();

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const damService = {
  // Get paginated list of assets
  async getAssets(query: { folder?: string; search?: string; page?: number; limit?: number; includeArchived?: boolean }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 20);
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Handle folders
    if (query.folder) {
      where.folder = query.folder;
    } else if (!query.includeArchived) {
      where.isArchived = false;
      where.folder = { not: 'Archive' };
    }

    // Handle search query
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.digitalAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.digitalAsset.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Register uploaded asset
  async registerAsset(data: {
    name: string;
    originalName: string;
    path: string;
    url: string;
    mimeType: string;
    extension: string;
    folder: string;
    sizeBytes: number;
    checksum?: string;
    uploadedBy?: string;
  }) {
    // Read dimensions if it is an image
    let width: number | undefined;
    let height: number | undefined;
    if (data.mimeType.startsWith('image/')) {
      try {
        const fullPath = path.resolve(process.cwd(), data.path);
        const dimensions = imageSize(fs.readFileSync(fullPath));
        width = dimensions.width;
        height = dimensions.height;
      } catch (err) {
        // ignore
      }
    }

    return prisma.digitalAsset.create({
      data: {
        name: data.name,
        originalName: data.originalName,
        path: data.path,
        url: data.url,
        mimeType: data.mimeType,
        extension: data.extension,
        folder: data.folder,
        sizeBytes: data.sizeBytes,
        width,
        height,
        checksum: data.checksum,
        uploadedBy: data.uploadedBy,
        tags: [],
      },
    });
  },

  // Replace file content (keeps same ID, url, path, increments version and updates checksum)
  async replaceAssetFile(id: string, file: Express.Multer.File) {
    const asset = await prisma.digitalAsset.findUniqueOrThrow({ where: { id } });
    
    // Use adapter to overwrite physical file
    const result = await storageProvider.replaceFile(asset.path, file);

    // Read new dimensions if image
    let width = asset.width;
    let height = asset.height;
    if (file.mimetype.startsWith('image/')) {
      try {
        const fullPath = path.resolve(process.cwd(), asset.path);
        const dimensions = imageSize(fs.readFileSync(fullPath));
        width = dimensions.width;
        height = dimensions.height;
      } catch (err) {
        // ignore
      }
    }

    return prisma.digitalAsset.update({
      where: { id },
      data: {
        sizeBytes: file.size,
        width,
        height,
        checksum: result.checksum,
        version: { increment: 1 },
      },
    });
  },

  // Soft Delete / Archive
  async archiveAsset(id: string) {
    return prisma.digitalAsset.update({
      where: { id },
      data: {
        isArchived: true,
        folder: 'Archive',
      },
    });
  },

  // Restore asset from archive
  async restoreAsset(id: string, targetFolder: string = 'Images') {
    return prisma.digitalAsset.update({
      where: { id },
      data: {
        isArchived: false,
        folder: targetFolder,
      },
    });
  },

  // Check asset usage
  async checkAssetUsage(id: string) {
    const asset = await prisma.digitalAsset.findUniqueOrThrow({ where: { id } });
    const url = asset.url;

    // Search matches in all tables
    const [
      projects,
      gallery,
      services,
      experiences,
      education,
      certificates,
      blogPosts,
      testimonials,
      settings,
    ] = await Promise.all([
      prisma.project.findMany({ where: { OR: [{ thumbnailAssetId: id }, { thumbnailUrl: url }] }, select: { title: true } }),
      prisma.gallery.findMany({ where: { OR: [{ imageAssetId: id }, { imageUrl: url }] }, select: { title: true } }),
      prisma.service.findMany({ where: { OR: [{ imageAssetId: id }, { imageUrl: url }] }, select: { title: true } }),
      prisma.experience.findMany({ where: { OR: [{ logoAssetId: id }, { companyLogoUrl: url }] }, select: { company: true } }),
      prisma.education.findMany({ where: { OR: [{ logoAssetId: id }, { institutionLogoUrl: url }] }, select: { institution: true } }),
      prisma.certificate.findMany({ where: { OR: [{ imageAssetId: id }, { imageUrl: url }] }, select: { title: true } }),
      prisma.blogPost.findMany({ where: { OR: [{ coverImageAssetId: id }, { coverImageUrl: url }] }, select: { title: true } }),
      prisma.testimonial.findMany({ where: { OR: [{ clientPhotoAssetId: id }, { clientPhotoUrl: url }] }, select: { clientName: true } }),
      prisma.siteSetting.findMany({ where: { value: url }, select: { key: true } }),
    ]);

    const usages: string[] = [];
    projects.forEach((p) => usages.push(`Project: ${p.title}`));
    gallery.forEach((g) => usages.push(`Gallery: ${g.title}`));
    services.forEach((s) => usages.push(`Service: ${s.title}`));
    experiences.forEach((e) => usages.push(`Experience: ${e.company}`));
    education.forEach((ed) => usages.push(`Education: ${ed.institution}`));
    certificates.forEach((c) => usages.push(`Certificate: ${c.title}`));
    blogPosts.forEach((b) => usages.push(`Blog Post: ${b.title}`));
    testimonials.forEach((t) => usages.push(`Testimonial: ${t.clientName}`));
    settings.forEach((s) => usages.push(`Site Setting: ${s.key}`));

    return usages;
  },

  // Permanent Delete
  async deleteAssetPermanently(id: string, force: boolean = false) {
    const usages = await this.checkAssetUsage(id);
    if (usages.length > 0 && !force) {
      throw new Error(`Cannot delete asset. It is currently referenced in: ${usages.join(', ')}`);
    }

    const asset = await prisma.digitalAsset.findUniqueOrThrow({ where: { id } });
    
    // Remove from physical storage
    await storageProvider.deleteFile(asset.path);

    // Delete database record
    return prisma.digitalAsset.delete({ where: { id } });
  },

  // Get DAM analytics stats
  async getDamAnalytics() {
    const [
      totalCount,
      allAssets,
    ] = await Promise.all([
      prisma.digitalAsset.count(),
      prisma.digitalAsset.findMany(),
    ]);

    // Group counts/sizes by folder type
    const folderStats: Record<string, { count: number; bytes: number }> = {};
    CONFIGURED_FOLDERS.forEach((f) => {
      folderStats[f] = { count: 0, bytes: 0 };
    });

    let totalBytes = 0;
    let unusedCount = 0;

    allAssets.forEach((a) => {
      const f = a.folder;
      if (!folderStats[f]) {
        folderStats[f] = { count: 0, bytes: 0 };
      }
      folderStats[f].count += 1;
      folderStats[f].bytes += a.sizeBytes;
      totalBytes += a.sizeBytes;

      if (a.usageCount === 0) {
        unusedCount += 1;
      }
    });

    // Largest files
    const largestFiles = [...allAssets]
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
      .slice(0, 5)
      .map((a) => ({ id: a.id, name: a.name, sizeBytes: a.sizeBytes, folder: a.folder, url: a.url }));

    return {
      summary: {
        totalAssets: totalCount,
        totalBytes,
        totalUsedGB: +(totalBytes / (1024 * 1024 * 1024)).toFixed(3),
        unusedAssets: unusedCount,
      },
      folders: folderStats,
      largestFiles,
    };
  },

  // Rename digital asset name
  async renameAsset(id: string, newName: string) {
    return prisma.digitalAsset.update({
      where: { id },
      data: { name: newName },
    });
  },

  // Add tags
  async updateAssetTags(id: string, tags: string[]) {
    return prisma.digitalAsset.update({
      where: { id },
      data: { tags },
    });
  },
};
