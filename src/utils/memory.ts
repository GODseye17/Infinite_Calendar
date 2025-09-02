class MemoryManager {
  private imageCache = new WeakMap<HTMLImageElement, string>();
  private loadedImages = new Set<string>();
  private maxCachedImages = 50;

  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedImages.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        this.imageCache.set(img, src);
        this.cleanupCache();
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  private cleanupCache() {
    if (this.loadedImages.size > this.maxCachedImages) {
      const imagesToRemove = Array.from(this.loadedImages).slice(0, 10);
      imagesToRemove.forEach(src => {
        this.loadedImages.delete(src);
      });
    }
  }

  unloadDistantImages(visibleImageUrls: Set<string>) {
    const imagesToRemove = Array.from(this.loadedImages).filter(
      src => !visibleImageUrls.has(src)
    );
    
    imagesToRemove.forEach(src => {
      this.loadedImages.delete(src);
    });
  }

  getMemoryUsage(): { cachedImages: number; maxImages: number } {
    return {
      cachedImages: this.loadedImages.size,
      maxImages: this.maxCachedImages
    };
  }

  clearCache() {
    this.loadedImages.clear();
  }
}

export const memoryManager = new MemoryManager();

export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  const promises = imageUrls.map(url => memoryManager.preloadImage(url));
  await Promise.allSettled(promises);
};

export const cleanupDistantImages = (visibleImageUrls: Set<string>) => {
  memoryManager.unloadDistantImages(visibleImageUrls);
};
