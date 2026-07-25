import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Tag, Copy, Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { publicApi } from '../../../services/api';
import { IMAGES } from '../../../constants/images';
import { motion } from 'framer-motion';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';

// ── Share Buttons Component ───────────────────────────────────────────────────
const ShareButtons: React.FC<{ title: string; url: string }> = ({ title, url }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-zinc-500 mr-1">{t('blog.shareTitle')}:</span>

      {/* Twitter/X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className="p-2 rounded-xl dark:bg-zinc-900 light:bg-slate-100 dark:border-zinc-800 light:border-slate-200 border text-zinc-400 hover:text-white hover:bg-black/80 transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.846L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="p-2 rounded-xl dark:bg-zinc-900 light:bg-slate-100 dark:border-zinc-800 light:border-slate-200 border text-zinc-400 hover:text-[#0a66c2] transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="p-2 rounded-xl dark:bg-zinc-900 light:bg-slate-100 dark:border-zinc-800 light:border-slate-200 border text-zinc-400 hover:text-[#25d366] transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className="p-2 rounded-xl dark:bg-zinc-900 light:bg-slate-100 dark:border-zinc-800 light:border-slate-200 border text-zinc-400 hover:text-accent-violet transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      {copied && (
        <span className="text-[10px] text-green-500 font-semibold">{t('common.copied')}</span>
      )}
    </div>
  );
};

// ── Related Posts Component ───────────────────────────────────────────────────
const RelatedPosts: React.FC<{ currentSlug: string; categoryName: string; allPosts: any[] }> = ({
  currentSlug, categoryName, allPosts
}) => {
  const { t } = useTranslation();
  const related = allPosts
    .filter(p => p.slug !== currentSlug && (p.category?.name || p.category) === categoryName)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="pt-12 border-t dark:border-zinc-800/60 light:border-slate-200 space-y-6">
      <h2 className="text-lg font-bold dark:text-white light:text-slate-800 font-display">
        {t('blog.relatedPosts')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((post: any) => (
          <MotionCard
            key={post.slug}
            delay={0.05}
            className="p-4 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/30 light:bg-white space-y-2 hover:border-accent-violet transition-colors"
          >
            {post.coverImageUrl || post.image ? (
              <div className="h-28 rounded-xl overflow-hidden border dark:border-zinc-800 light:border-slate-200">
                <img src={post.coverImageUrl || post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
            ) : null}
            <Link to={`/blog/${post.slug}`} className="block group">
              <h3 className="text-xs font-bold dark:text-white light:text-slate-800 leading-snug group-hover:text-accent-violet transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
            <p className="text-[10px] dark:text-zinc-500 light:text-slate-400 line-clamp-2">{post.excerpt || post.desc}</p>
          </MotionCard>
        ))}
      </div>
    </section>
  );
};

// ── Main BlogDetailPage ───────────────────────────────────────────────────────
export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['public-blog-post', slug],
    queryFn: () => publicApi.getBlogPostBySlug(slug || ''),
    enabled: !!slug,
  });

  const { data: blogResponse } = useQuery({
    queryKey: ['public-blog-posts'],
    queryFn: () => publicApi.getBlogPosts(),
  });

  const allPosts: any[] = blogResponse?.data || [];

  // Build prev/next navigation
  const sortedPosts = [...allPosts].sort(
    (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );
  const currentIndex = sortedPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;

  // Dynamic SEO, OpenGraph and Structured Data Schema.org injection
  useEffect(() => {
    if (!post) return;

    const originalTitle = document.title;
    document.title = `${post.title} | Denis Chamkaga`;

    const canonicalUrl = `${window.location.origin}/blog/${post.slug}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', nameOrProperty);
        } else {
          el.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', post.excerpt || 'Denis Chamkaga technology blog post.');
    setMeta('og:title', post.title, true);
    setMeta('og:description', post.excerpt || 'Denis Chamkaga technology blog post.', true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', 'article', true);
    if (post.coverImageUrl) {
      setMeta('og:image', post.coverImageUrl, true);
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "image": post.coverImageUrl || IMAGES.about.consulting,
      "datePublished": post.publishedAt || post.createdAt,
      "author": {
        "@type": "Person",
        "name": post.author ? `${post.author.firstName} ${post.author.lastName}` : "Denis Chamkaga"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Denis Chamkaga Platform",
        "logo": {
          "@type": "ImageObject",
          "url": IMAGES.about.consulting
        }
      },
      "description": post.excerpt || ''
    };

    const scriptId = 'blog-jsonld';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.innerHTML = JSON.stringify(jsonLd);

    return () => {
      document.title = originalTitle;
      if (scriptEl) scriptEl.remove();
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent-violet border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-body">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !post) {
    const isSwahili = i18n.language === 'sw';
    // Fallback for static/mock posts
    const isMock = slug?.includes('social-media') || slug?.includes('customer-service') || slug?.includes('huduma') || slug?.includes('database') || slug?.includes('kanzidata') || slug?.includes('sla') || slug?.includes('mitandao') || slug?.includes('organized-database');

    if (isMock) {
      const mockPost = {
        title: slug?.includes('social-media') || slug?.includes('mitandao')
          ? (isSwahili ? 'Kwa Nini Mitandao ya Kijamii Pekee Haitoshi kwa Ukuaji wa Biashara' : 'Why Social Media Alone Is Not Enough for Business Growth')
          : slug?.includes('customer-service') || slug?.includes('huduma') || slug?.includes('sla')
          ? (isSwahili ? 'Yale Ambayo Huduma kwa Wateja Imenifundisha Kuhusu Kujenga Mifumo Bora' : 'What Customer Service Has Taught Me About Building Better Systems')
          : (isSwahili ? 'Kwa Nini Kila Biashara Inahitaji Kanzidata (Database) Iliyopangwa Vizuri' : 'Why Every Business Needs a Well-Organized Database'),
        category: slug?.includes('social-media') || slug?.includes('mitandao')
          ? (isSwahili ? 'Mkakati wa IT' : 'IT Strategy')
          : slug?.includes('customer-service') || slug?.includes('huduma') || slug?.includes('sla')
          ? (isSwahili ? 'Mkakati wa Wateja' : 'Customer Strategy')
          : (isSwahili ? 'Muundo wa Database' : 'Database Design'),
        date: isSwahili ? 'Juni 24, 2026' : 'June 24, 2026',
        readTime: isSwahili ? 'Dakika 6 kusoma' : '6 min read',
        image: slug?.includes('social-media') || slug?.includes('mitandao')
          ? IMAGES.about.consulting
          : slug?.includes('customer-service') || slug?.includes('huduma') || slug?.includes('sla')
          ? IMAGES.services.customerSupport
          : IMAGES.services.databaseDesign,
        content: slug?.includes('social-media') || slug?.includes('mitandao')
          ? (isSwahili 
              ? `Biashara nyingi ndogo zinategemea kabisa Facebook, Instagram au WhatsApp kuwahudumia wateja. Ingawa programu hizi ni nzuri kwa masoko, hazitoshi kama mifumo mikuu ya kusimamia shughuli za biashara. Ili kukua, biashara yoyote inahitaji ufuatiliaji mzuri wa wateja na kumbukumbu zilizopangwa.\n\nKuwa na tovuti ya kitaalamu au mfumo maalum wa biashara kunaongeza uaminifu kwa wateja na kuweka mpangilio mzuri wa muda mrefu. Inakuruhusu kufuatilia maagizo kwa utaratibu, kuhifadhi mapendeleo ya wateja, na kutengeneza ankara kiotomatiki. Kuhama kutoka kwenye picha za skrini za mazungumzo kwenda kwenye mfumo safi kunatayarisha biashara yako kwa ukuaji.`
              : `Many small businesses rely entirely on Facebook, Instagram or WhatsApp to serve customers. While these apps are great for marketing, they fail as core business software systems. To scale, any enterprise needs structured customer tracking and organized records.\n\nHaving a professional website or custom business system improves customer trust and long-term organization. It allows you to track orders systematically, save customer preferences, and automate invoices. Moving from scattered screenshots of chat histories to a clean system makes your business ready for growth.`)
          : slug?.includes('customer-service') || slug?.includes('huduma') || slug?.includes('sla')
          ? (isSwahili
              ? `Baada ya miaka mingi ya kufanya kazi katika huduma kwa wateja, nimejifunza kwamba programu nzuri sio tu kuhusu teknolojia—inapaswa pia kurahisisha watu kuwasiliana, kutatua changamoto na kupokea huduma bora.\n\nKila kitufe na fomu inapaswa kuundwa kwa kumfikiria mtumiaji wa mwisho. Ikiwa mteja analazimika kusubiri kwa saa nyingi kwa sababu habari zimetawanyika kwenye mifumo tofauti, teknolojia inakuwa imewafeli. Katika makala hii, ninashiriki maoni juu ya jinsi kurahisisha michakato ya kazi na kuweka kipaumbele mawasiliano ya mtumiaji kunatusaidia kujenga zana za kidijitali ambazo zinawahudumia watu kikamilifu.`
              : `After years of working in customer service, I've learned that great software is not just about technology—it should also make it easier for people to communicate, solve problems and receive better service.\n\nEvery button and form should be designed with the end-user in mind. If a customer has to wait hours because information is scattered across different systems, the technology is failing them. In this article, I share insights on how simplifying workflow processes and prioritizing user communication helps us build digital tools that actually serve people.`)
          : (isSwahili
              ? `Kanzidata (database) nzuri husaidia biashara kuweka kumbukumbu zikiwa zimepangwa, kupunguza urudufishaji wa taarifa na kufanya habari kupatikana kwa urahisi. Makala hii inaeleza umuhimu wa usimamizi sahihi wa data kwa lugha rahisi.\n\nBiashara nyingi zinazokua huanza kwa kufuatilia kila kitu kwenye Excel au laha za kazi. Baada ya muda, faili huathirika, rekodi zinajirudia, na kupata historia rahisi ya mteja inakuwa changamoto. Kanzidata iliyoundwa vizuri inahakikisha usalama wa taarifa, inaleta nidhamu ya kumbukumbu, na inakuwa msingi wa ripoti sahihi za biashara.`
              : `A good database helps businesses keep records organized, reduce duplication and make information easier to find. This article explains the importance of proper data management in simple language.\n\nMany growing businesses start by tracking everything in Excel or spreadsheets. Over time, files become corrupted, duplicate entries appear, and finding a simple client history becomes a headache. A structured database ensures data integrity, enforces organization, and acts as the foundation for clean reports and dashboard insights.`)
      };

      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left font-body">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-8 flex-wrap">
            <Link to="/" className="hover:text-accent-violet transition-colors">{t('blog.breadcrumbHome')}</Link>
            <ChevronRight size={12} />
            <Link to="/blog" className="hover:text-accent-violet transition-colors">{t('blog.breadcrumbBlog')}</Link>
            <ChevronRight size={12} />
            <span className="dark:text-zinc-300 light:text-slate-600 truncate max-w-xs">{mockPost.title}</span>
          </nav>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block text-[10px] font-bold text-white bg-accent-violet px-2.5 py-1 rounded-lg uppercase tracking-wider">{mockPost.category}</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">{mockPost.title}</h1>
              <div className="flex gap-4 text-xs text-zinc-500 pt-2 border-b dark:border-zinc-800 pb-4">
                <span className="flex items-center gap-1"><Calendar size={13} /> {mockPost.date}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {mockPost.readTime}</span>
              </div>
            </div>
            <div className="h-64 sm:h-96 rounded-2xl overflow-hidden border dark:border-zinc-800">
              <img src={mockPost.image} alt={mockPost.title} className="w-full h-full object-cover" />
            </div>
            <article className="prose dark:prose-invert max-w-none pt-4 whitespace-pre-line leading-relaxed text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
              {mockPost.content}
            </article>
            <div className="pt-6 border-t dark:border-zinc-800">
              <ShareButtons title={mockPost.title} url={pageUrl} />
            </div>
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-violet hover:underline">
              <ArrowLeft size={14} /> {t('common.backToBlog')}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500 font-bold">{t('common.error')}</p>
        <Link to="/blog" className="text-xs font-semibold text-accent-violet hover:underline">{t('common.backToBlog')}</Link>
      </div>
    );
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Draft';

  const categoryName = post.category?.name || 'Insight';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left font-body relative">
      <PageTitle title={`${post.title} | Denis Chamkaga`} description={post.excerpt || ''} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-8 flex-wrap">
        <Link to="/" className="hover:text-accent-violet transition-colors">{t('blog.breadcrumbHome')}</Link>
        <ChevronRight size={12} />
        <Link to="/blog" className="hover:text-accent-violet transition-colors">{t('blog.breadcrumbBlog')}</Link>
        <ChevronRight size={12} />
        <span className="dark:text-zinc-300 light:text-slate-600 truncate max-w-xs">{post.title}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Header Metadata */}
        <div className="space-y-4">
          <span className="inline-block text-[10px] font-bold text-white bg-accent-violet px-2.5 py-1 rounded-lg uppercase tracking-wider font-display">
            {categoryName}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold dark:text-white light:text-slate-800 tracking-tight leading-tight font-display">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 pt-4 border-y dark:border-zinc-800/80 light:border-slate-200 py-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {post.readingTime ? `${post.readingTime} min read` : '5 min read'}
            </span>
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} />
                By {post.author.firstName} {post.author.lastName}
              </span>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="h-64 sm:h-[450px] w-full rounded-3xl overflow-hidden border dark:border-zinc-800/60 light:border-slate-200 shadow-xl">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article Body Content */}
        <article
          className="prose dark:prose-invert max-w-none pt-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base font-body space-y-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags Footer */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 border-t dark:border-zinc-800/60 light:border-slate-200 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1 mr-2">
              <Tag size={13} /> Tags:
            </span>
            {post.tags.map((t: any) => (
              <span key={t.tag.id} className="text-xs dark:bg-zinc-900 light:bg-slate-100 dark:text-zinc-400 light:text-slate-600 px-3 py-1.5 rounded-xl border dark:border-zinc-800 light:border-slate-200 font-medium">
                #{t.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Share Buttons */}
        <div className="pt-6 border-t dark:border-zinc-800/60 light:border-slate-200">
          <ShareButtons title={post.title} url={pageUrl} />
        </div>

        {/* Related Posts */}
        {allPosts.length > 0 && (
          <RelatedPosts currentSlug={slug || ''} categoryName={categoryName} allPosts={allPosts} />
        )}

        {/* Previous / Next Navigation */}
        {(prevPost || nextPost) && (
          <div className="pt-8 border-t dark:border-zinc-800/60 light:border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                to={`/blog/${prevPost.slug}`}
                className="group p-4 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/30 light:bg-white hover:border-accent-violet transition-colors space-y-1"
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowLeft size={11} /> {t('blog.prevPost')}
                </span>
                <p className="text-xs font-semibold dark:text-white light:text-slate-700 group-hover:text-accent-violet transition-colors line-clamp-2">
                  {prevPost.title}
                </p>
              </Link>
            ) : <div />}

            {nextPost ? (
              <Link
                to={`/blog/${nextPost.slug}`}
                className="group p-4 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/30 light:bg-white hover:border-accent-violet transition-colors space-y-1 text-right"
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 justify-end">
                  {t('blog.nextPost')} <ArrowRight size={11} />
                </span>
                <p className="text-xs font-semibold dark:text-white light:text-slate-700 group-hover:text-accent-violet transition-colors line-clamp-2">
                  {nextPost.title}
                </p>
              </Link>
            ) : <div />}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BlogDetailPage;
