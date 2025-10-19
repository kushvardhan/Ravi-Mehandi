// Single consolidated script for nav, smooth scroll, header, carousel and lightbox
(function () {
  // Shared touch variables
  let touchStartX = 0;
  let touchEndX = 0;

  // Hero Carousel - Rotating Images
  const heroCarousel = document.getElementById("heroCarousel");
  if (heroCarousel) {
    const slides = heroCarousel.querySelectorAll(".hero-slide");
    let currentSlide = 0;

    function rotateHeroSlides() {
      // The CSS animation handles the rotation automatically
      // This is just for reference - the animation is defined in CSS
      currentSlide = (currentSlide + 1) % slides.length;
    }

    // Optional: Rotate every 15 seconds (matches CSS animation)
    setInterval(rotateHeroSlides, 15000);
  }

  // Hero Carousel - JS driven: toggle .active every 4 seconds
  if (heroCarousel) {
    const slides = Array.from(heroCarousel.querySelectorAll(".hero-slide"));
    let current = 0;

    function showSlide(idx) {
      slides.forEach((s, i) => {
        s.classList.toggle("active", i === idx);
      });
    }

    // Ensure first slide is visible
    if (slides.length) showSlide(0);

    // rotate every 4 seconds
    const HERO_INTERVAL = 4000;
    let heroTimer = setInterval(() => {
      current = (current + 1) % slides.length;
      showSlide(current);
    }, HERO_INTERVAL);

    // Pause on hover to improve UX
    heroCarousel.addEventListener("mouseenter", () => clearInterval(heroTimer));
    heroCarousel.addEventListener("mouseleave", () => {
      heroTimer = setInterval(() => {
        current = (current + 1) % slides.length;
        showSlide(current);
      }, HERO_INTERVAL);
    });
  }

  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  navToggle &&
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = nav.classList.contains("open");
      navToggle.setAttribute("aria-expanded", expanded);
    });

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      if (href.startsWith("#")) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (nav && nav.classList.contains("open")) nav.classList.remove("open");
        navToggle && navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Header shrink on scroll
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lbImage = document.getElementById("lbImage");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  const galleryImgs = Array.from(
    document.querySelectorAll(".card-image, .gallery-item img")
  );
  const images = galleryImgs.map((i) => i.getAttribute("src"));
  let currentIndex = 0;

  function openLightbox(idx) {
    if (!lightbox || !lbImage) return;
    currentIndex = (idx + images.length) % images.length;
    lbImage.src = images[currentIndex];
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.classList.remove("open");
    lbImage && lbImage.classList.remove("zoomed");
    document.body.style.overflow = "";
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    lbImage.src = images[currentIndex];
    lbImage.classList.remove("zoomed");
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lbImage.src = images[currentIndex];
    lbImage.classList.remove("zoomed");
  }

  // delegated click to open
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;
    if (
      t.matches(".card-image, .card-image *") ||
      t.matches(".gallery-item img")
    ) {
      const img = t.closest(".card")
        ? t.closest(".card").querySelector(".card-image")
        : t.tagName === "IMG"
        ? t
        : null;
      if (img) {
        const src = img.getAttribute("src");
        const idx = images.indexOf(src);
        if (idx >= 0) openLightbox(idx);
      }
    }
  });

  lbClose && lbClose.addEventListener("click", closeLightbox);
  lbNext && lbNext.addEventListener("click", nextImage);
  lbPrev && lbPrev.addEventListener("click", prevImage);

  lightbox &&
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

  // Touch swipe support for lightbox
  lightbox &&
    lightbox.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

  lightbox &&
    lightbox.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) nextImage();
      if (touchEndX - touchStartX > 50) prevImage();
    });

  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });

  lbImage &&
    lbImage.addEventListener("click", () => lbImage.classList.toggle("zoomed"));

  // footer year
  const yearEl = document.getElementById("year");
  yearEl && (yearEl.textContent = new Date().getFullYear());

  // Scroll-triggered animations using Intersection Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  document
    .querySelectorAll(".card, .service-card, .review-card")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

  // Gallery carousel: true infinite loop by prepending + appending clones
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const galleryCarousel = document.getElementById("galleryCarousel");
  let slideIndex = 0,
    originalCount = 0,
    cardWidth = 0,
    gapPx = 0;

  function updateCardMetrics() {
    if (!track || !track.children.length) return;
    // Pick a representative card (first) to compute width
    const first = track.querySelector(".card");
    if (!first) return;
    // compute the current CSS gap (works in modern browsers)
    const cs = window.getComputedStyle(track);
    const gapStr =
      cs.getPropertyValue("gap") || cs.getPropertyValue("column-gap") || "0px";
    gapPx = parseFloat(gapStr) || 0;
    cardWidth = first.getBoundingClientRect().width + gapPx;
  }

  function setTranslate(transition = true) {
    if (!track) return;
    updateCardMetrics();
    track.style.transition = transition
      ? "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
      : "none";
    track.style.transform = `translateX(${-slideIndex * cardWidth}px)`;
  }

  // Handle seamless wrap: when reaching clones, jump back to middle copy
  if (track) {
    track.addEventListener("transitionend", () => {
      if (!originalCount) return;
      // If we've advanced into the appended clones (right side)
      if (slideIndex >= originalCount * 2) {
        slideIndex -= originalCount;
        setTranslate(false);
      }
      // If we've moved into the prepended clones (left side)
      else if (slideIndex < originalCount) {
        slideIndex += originalCount;
        setTranslate(false);
      }
    });
  }

  // Prev / Next controls
  prevBtn &&
    prevBtn.addEventListener("click", () => {
      slideIndex -= 1;
      setTranslate();
      stopAutoplay();
      startAutoplay();
    });

  nextBtn &&
    nextBtn.addEventListener("click", () => {
      slideIndex += 1;
      setTranslate();
      stopAutoplay();
      startAutoplay();
    });

  // Touch swipe support
  if (galleryCarousel) {
    galleryCarousel.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    });

    galleryCarousel.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        slideIndex += 1;
        setTranslate();
      } else if (touchEndX - touchStartX > 50) {
        slideIndex -= 1;
        setTranslate();
      }
      startAutoplay();
    });
  }

  // Build clones (prepend + append) and center start index
  window.addEventListener("load", () => {
    if (!track) return;
    const originals = Array.from(track.children);
    originalCount = originals.length;
    if (originalCount === 0) return;

    // Append clones (end)
    originals.forEach((node) => track.appendChild(node.cloneNode(true)));

    // Prepend clones (start) - insert in same order before first child
    // We need to insert the clones in order, so iterate originals in reverse and insert before firstChild
    originals
      .slice()
      .reverse()
      .forEach((node) =>
        track.insertBefore(node.cloneNode(true), track.firstChild)
      );

    // Start in the middle copy so we can move left/right seamlessly
    slideIndex = originalCount;

    // small delay so layout stabilizes
    setTimeout(() => {
      updateCardMetrics();
      setTranslate(false);
    }, 120);
  });

  window.addEventListener("resize", () => {
    setTimeout(() => {
      updateCardMetrics();
      setTranslate(false);
    }, 120);
  });

  // Autoplay (one image at a time)
  let autoplayInterval = null;
  function startAutoplay() {
    if (autoplayInterval) return;
    autoplayInterval = setInterval(() => {
      slideIndex += 1;
      setTranslate();
    }, 4000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }

  galleryCarousel &&
    galleryCarousel.addEventListener("mouseenter", stopAutoplay);
  galleryCarousel &&
    galleryCarousel.addEventListener("mouseleave", startAutoplay);
  galleryCarousel && galleryCarousel.addEventListener("focusin", stopAutoplay);
  galleryCarousel &&
    galleryCarousel.addEventListener("focusout", startAutoplay);

  // start
  startAutoplay();

  // Reviews carousel - infinite loop (one card per click) using cloned slides
  const reviewsTrack = document.getElementById("reviewsTrack");
  const reviewsViewport = document.querySelector(".reviews-viewport");
  const reviewsPrevBtn = document.getElementById("reviewsPrev");
  const reviewsNextBtn = document.getElementById("reviewsNext");

  if (reviewsTrack && reviewsViewport && reviewsPrevBtn && reviewsNextBtn) {
    let cardWidth = 0;
    const gap = 20; // should match CSS .reviews-track gap
    let isScrolling = false;
    let originalCount = 0;
    let slideIndex = 0; // absolute index in the track (includes clones)

    function getCardWidth() {
      const card = reviewsTrack.querySelector(".review-card");
      if (!card) return 280;
      return card.getBoundingClientRect().width;
    }

    function updateMetrics() {
      cardWidth = getCardWidth();
    }

    function scrollToIndex(idx, smooth = true) {
      if (!reviewsViewport) return;
      isScrolling = true;
      const step = cardWidth + gap;
      reviewsViewport.scrollTo({
        left: idx * step,
        behavior: smooth ? "smooth" : "auto",
      });
      // after transition, handle wrapping
      setTimeout(() => {
        isScrolling = false;
        handleWrap();
      }, 500);
    }

    function handleWrap() {
      const step = cardWidth + gap;
      const total = originalCount * 3;
      if (slideIndex >= originalCount * 2) {
        // jumped into appended clones; move back to middle copy
        slideIndex -= originalCount;
        reviewsViewport.scrollLeft = slideIndex * step;
      } else if (slideIndex < originalCount) {
        // jumped into prepended clones; move forward to middle copy
        slideIndex += originalCount;
        reviewsViewport.scrollLeft = slideIndex * step;
      }
    }

    // Prev / Next handlers (one card at a time)
    reviewsPrevBtn.addEventListener("click", () => {
      if (isScrolling) return;
      slideIndex -= 1;
      scrollToIndex(slideIndex, true);
    });

    reviewsNextBtn.addEventListener("click", () => {
      if (isScrolling) return;
      slideIndex += 1;
      scrollToIndex(slideIndex, true);
    });

    // Touch swipe support
    let rvTouchStartX = 0;
    reviewsViewport.addEventListener("touchstart", (e) => {
      rvTouchStartX = e.touches[0].clientX;
    });

    reviewsViewport.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = rvTouchStartX - touchEndX;
      if (Math.abs(diff) < 30) return;
      if (diff > 50) {
        slideIndex += 1;
        scrollToIndex(slideIndex, true);
      } else if (diff < -50) {
        slideIndex -= 1;
        scrollToIndex(slideIndex, true);
      }
    });

    // Build clones and initialize
    window.addEventListener("load", () => {
      const originals = Array.from(reviewsTrack.children);
      originalCount = originals.length;
      if (originalCount === 0) return;

      // append clones
      originals.forEach((n) => reviewsTrack.appendChild(n.cloneNode(true)));
      // prepend clones (reverse order)
      originals
        .slice()
        .reverse()
        .forEach((n) =>
          reviewsTrack.insertBefore(n.cloneNode(true), reviewsTrack.firstChild)
        );

      updateMetrics();
      // start in middle copy
      slideIndex = originalCount;
      // set scroll position without animation
      setTimeout(() => {
        scrollToIndex(slideIndex, false);
      }, 80);
    });

    window.addEventListener("resize", () => {
      setTimeout(() => {
        updateMetrics();
        // reposition to current logical slide without transition
        scrollToIndex(slideIndex, false);
      }, 120);
    });
  }
})();
