// backend/src/ai/utils/bm25.ts
// Standard BM25 (Best Matching 25) text relevance ranking algorithm in pure TypeScript.

const STOPWORDS = new Set([
  // English Stopwords
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed',
  'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
  'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most',
  'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some',
  'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these',
  'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres',
  'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll',
  'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves',
  // Swahili Stopwords
  'na', 'kwa', 'katika', 'ni', 'wa', 'ya', 'nao', 'ndio', 'hadi', 'hata', 'la', 'cha', 'za', 'vi', 'ki', 'yo', 'ko', 'po',
  'mimi', 'sisi', 'yeye', 'wao', 'wewe', 'nyinyi', 'huyu', 'hawa', 'lile', 'yale', 'ile', 'zile', 'kile', 'vile'
]);

export class BM25 {
  private documents: string[] = [];
  private docLengths: number[] = [];
  private avgDocLength: number = 0;
  private df: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private k1: number;
  private b: number;

  constructor(documents: string[], k1 = 1.5, b = 0.75) {
    this.documents = documents;
    this.k1 = k1;
    this.b = b;
    this.initialize();
  }

  /**
   * Cleans punctuation, converts to lowercase, splits by whitespace, and removes stopwords.
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // replace punctuation with spaces
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !STOPWORDS.has(w));
  }

  private initialize() {
    const N = this.documents.length;
    if (N === 0) return;

    let totalLength = 0;
    const docTerms: string[][] = [];

    for (const doc of this.documents) {
      const terms = this.tokenize(doc);
      docTerms.push(terms);
      this.docLengths.push(terms.length);
      totalLength += terms.length;

      // Count document frequency (df) for each term
      const uniqueTerms = new Set(terms);
      for (const term of uniqueTerms) {
        this.df.set(term, (this.df.get(term) || 0) + 1);
      }
    }

    this.avgDocLength = totalLength / N;

    // Calculate Inverse Document Frequency (IDF) for all words in vocabulary
    for (const [term, count] of this.df.entries()) {
      // Standard BM25 IDF formulation with a floor of 0
      const idfValue = Math.log((N - count + 0.5) / (count + 0.5) + 1);
      this.idf.set(term, Math.max(0.0001, idfValue));
    }
  }

  /**
   * Computes the relevance score for each document against the query.
   */
  public search(query: string): number[] {
    const queryTerms = this.tokenize(query);
    if (queryTerms.length === 0 || this.documents.length === 0) {
      return new Array(this.documents.length).fill(0);
    }

    return this.documents.map((_, idx) => {
      let score = 0;
      const docLength = this.docLengths[idx];
      if (docLength === 0) return 0;

      const terms = this.tokenize(this.documents[idx]);
      
      // Calculate term frequencies in the current document
      const tfMap: Map<string, number> = new Map();
      for (const t of terms) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      for (const qTerm of queryTerms) {
        const idfVal = this.idf.get(qTerm);
        if (idfVal === undefined) continue; // query term not in vocabulary

        const tf = tfMap.get(qTerm) || 0;
        if (tf > 0) {
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength));
          score += idfVal * (numerator / denominator);
        }
      }
      return score;
    });
  }
}
