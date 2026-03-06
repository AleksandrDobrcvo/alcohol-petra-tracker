// Simple cache handler for Next.js incremental builds
const fs = require('fs');
const path = require('path');

class CacheHandler {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.next/cache');
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async get(key) {
    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      if (fs.existsSync(cacheFile)) {
        const data = fs.readFileSync(cacheFile, 'utf8');
        const parsed = JSON.parse(data);
        // Return null if cache is expired (1 hour)
        if (Date.now() - parsed.timestamp > 3600000) {
          fs.unlinkSync(cacheFile);
          return null;
        }
        return parsed.value;
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }
    return null;
  }

  async set(key, value) {
    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      const data = {
        value,
        timestamp: Date.now(),
      };
      fs.writeFileSync(cacheFile, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async revalidateTag(tag) {
    // Simple tag invalidation
    try {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        if (file.includes(tag)) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      });
    } catch (error) {
      console.error('Cache revalidation error:', error);
    }
  }
}

module.exports = CacheHandler;
