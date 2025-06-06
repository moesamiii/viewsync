// ======= Mobile Menu Toggle =======
const toggleBtn = document.querySelector(".mobile-nav-toggle");
const mobileNav = document.querySelector(".mobile-nav");

toggleBtn?.addEventListener("click", () => {
  mobileNav?.classList.toggle("active");
});

// ======= Slider Videos Initialization =======
const slides = document.querySelectorAll(".slide");

slides.forEach((slide) => {
  slide.addEventListener("click", () => {
    // Reset all slides and pause videos
    slides.forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".slider-video").forEach((v) => {
      v.pause();
      v.currentTime = 0;
    });

    // Activate clicked slide and play its video
    slide.classList.add("active");
    const video = slide.querySelector(".slider-video");
    if (video) video.play();
  });
});

// ======= Slider Navigation =======
const track = document.querySelector(".slider-track");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");

const slideWidth = 250; // Match with CSS
const visibleSlides = 4;
let currentPosition = 0;

leftArrow?.addEventListener("click", () => {
  currentPosition = Math.min(currentPosition + slideWidth * 2, 0);
  if (track) track.style.transform = `translateX(${currentPosition}px)`;
});

rightArrow?.addEventListener("click", () => {
  const maxScroll = -((slides.length - visibleSlides) * slideWidth);
  currentPosition = Math.max(currentPosition - slideWidth * 2, maxScroll);
  if (track) track.style.transform = `translateX(${currentPosition}px)`;
});

// ======= Gallery Functionality =======
let currentIndex = 0;

function showSelected(imgSrc, title, desc, activeSlide) {
  const preview = document.getElementById("main-preview");
  if (!preview) return;

  preview.style.opacity = 0;
  setTimeout(() => {
    preview.src = imgSrc;
    preview.style.opacity = 1;
  }, 100);

  const titleEl = document.getElementById("preview-title");
  const descEl = document.getElementById("preview-desc");

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  slides.forEach((slide) => slide.classList.remove("active"));
  if (activeSlide) activeSlide.classList.add("active");
}

function moveSlider(direction) {
  const slider = document.querySelector(".thumbnail-slider");
  if (!slider) return;

  currentIndex = (currentIndex + direction + slides.length) % slides.length;

  const targetSlide = slides[currentIndex];
  if (!targetSlide) return;

  slider.scrollTo({
    left: targetSlide.offsetLeft - 50,
    behavior: "smooth",
  });

  // Extract info from onclick attribute safely
  const onclickAttr = targetSlide.getAttribute("onclick");
  if (!onclickAttr) return;

  const matches = [...onclickAttr.matchAll(/'([^']+)'/g)];
  if (matches.length < 3) return;

  const imgSrc = matches[0][1].replace("-thumb", "-full");
  const title = matches[1][1];
  const desc = matches[2][1];

  showSelected(imgSrc, title, desc, targetSlide);
}

// Initialize gallery on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const firstSlide = slides[0];
  if (!firstSlide) return;

  firstSlide.classList.add("active");
  const onclickAttr = firstSlide.getAttribute("onclick");
  if (!onclickAttr) return;

  const matches = [...onclickAttr.matchAll(/'([^']+)'/g)];
  if (matches.length < 3) return;

  const imgSrc = matches[0][1].replace("-thumb", "-full");
  const title = matches[1][1];
  const desc = matches[2][1];
  showSelected(imgSrc, title, desc, firstSlide);
});

// ======= Video Controls =======
document.addEventListener("DOMContentLoaded", () => {
  const fsvhVideo = document.getElementById("fsvh-main-video");
  const videoHero = document.querySelector(".fs-video-hero");

  if (!fsvhVideo || !videoHero) return;

  // Play video on hero click (useful for mobile devices)
  videoHero.addEventListener("click", () => {
    if (fsvhVideo.paused) {
      fsvhVideo.play().catch((e) => {
        console.log("Video autoplay prevented:", e);
      });
    }
  });

  // Fallback image if video fails
  fsvhVideo.addEventListener("error", () => {
    console.log("Video failed to load");
    const fallbackImg = document.createElement("img");
    fallbackImg.src = "fallback-image.jpg";
    fallbackImg.style.width = "100%";
    fallbackImg.style.height = "100%";
    fallbackImg.style.objectFit = "cover";
    fsvhVideo.parentNode.replaceChild(fallbackImg, fsvhVideo);
  });
});

// ======= Three.js 3D Model Setup =======
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("model-container");
  if (!container) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f9fa);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  container.appendChild(renderer.domElement);

  // 3-point lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-2, 1, -1);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(0, 2, -3);
  scene.add(rimLight);

  // Load GLTF model
  const loader = new THREE.GLTFLoader();

  loader.load(
    "handy/scene.gltf",
    (gltf) => {
      const model = gltf.scene;

      // Center and scale model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Auto-scale camera distance
      const size = box.getSize(new THREE.Vector3()).length();
      camera.position.z = size * 1.5;

      scene.add(model);
      document
        .querySelector(".loading-text")
        ?.style.setProperty("display", "none");

      // Add scroll indicator arrow
      const arrow = document.createElement("div");
      arrow.className = "scroll-down-arrow";
      arrow.textContent = "↓";
      document.getElementById("3d-section")?.appendChild(arrow);
    },
    undefined,
    (error) => {
      console.error("Model loading error:", error);
    }
  );

  // OrbitControls setup
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI * 0.85;

  // Scroll and interaction flags
  let isInteracting = false;
  let enableScroll = true;

  controls.addEventListener("start", () => {
    isInteracting = true;
    container.classList.add("dragging");
    enableScroll = false;
  });

  controls.addEventListener("end", () => {
    isInteracting = false;
    container.classList.remove("dragging");
    setTimeout(() => (enableScroll = true), 100);
  });

  // Escape key to reset controls
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isInteracting) {
      controls.reset();
      isInteracting = false;
      enableScroll = true;
    }
  });

  // Click outside container to enable scroll again
  document.addEventListener("mousedown", (e) => {
    if (!e.target.closest("#model-container")) {
      enableScroll = true;
    }
  });

  // Disable wheel scroll during interaction
  window.addEventListener(
    "wheel",
    (e) => {
      if (!enableScroll || isInteracting) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Responsive resize handler
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});
