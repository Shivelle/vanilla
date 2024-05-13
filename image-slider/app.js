const carousel = document.querySelector('.carousel');
const nextBtn = document.getElementById('carousel-next');
const prevBtn = document.getElementById('carousel-prev');
const carouselList = document.querySelector('.carousel-list');
const thumbnails = document.querySelector('.carousel-thumbnails');
const animationDuration = 3000;

let autoSlideTime;
let timeout;
let autoRun = setTimeout(() => {
  showSlide('next');
}, autoSlideTime);

nextBtn.addEventListener('click', () => {
  showSlide('next');
});

prevBtn.addEventListener('click', () => {
  showSlide('prev');
});

function showSlide(direction) {
  let carouselItems = document.querySelectorAll('.carousel-item');
  let thumbnailItems = document.querySelectorAll('.carousel-thumbnail-item');

  if (direction === 'next') {
    carouselList.appendChild(carouselItems[0]);
    thumbnails.appendChild(thumbnailItems[0]);
    carousel.classList.add('next');
  } else {
    carouselList.prepend(carouselItems[carouselItems.length - 1]);
    thumbnails.prepend(thumbnailItems[thumbnailItems.length - 1]);
    carousel.classList.add('prev');
  }

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    carousel.classList.remove('next');
    carousel.classList.remove('prev');
  }, animationDuration);

  clearTimeout(autoRun);
}