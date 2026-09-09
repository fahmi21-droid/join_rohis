const ADMIN_WA = '6285782023998';

const opening = document.getElementById('opening');
const registration = document.getElementById('registration');
const storyTrack = document.getElementById('storyTrack');
const slides = [...document.querySelectorAll('.story-slide')];
const segments = [...document.querySelectorAll('.progress-segment')];
const prevSlide = document.getElementById('prevSlide');
const nextSlide = document.getElementById('nextSlide');
const skipOpening = document.getElementById('skipOpening');
const startRegistration = document.getElementById('startRegistration');
const backToOpening = document.getElementById('backToOpening');
const brandBack = document.getElementById('brandBack');
const currentSlideNumber = document.getElementById('currentSlideNumber');
const form = document.getElementById('formRohis');
const alasan = document.getElementById('alasan');
const count = document.getElementById('count');

let currentSlide = 0;
let timer = null;
const SLIDE_MS = 5800;
let touchStartX = 0;

function showScreen(next, current) {
  if (next === current) return;
  current.classList.add('is-leaving');
  stopAutoplay();

  setTimeout(() => {
    current.classList.remove('is-active', 'is-leaving', 'is-entering');
    current.setAttribute('aria-hidden', 'true');
    next.classList.add('is-active', 'is-entering');
    next.setAttribute('aria-hidden', 'false');
    window.scrollTo({ top: 0, behavior: 'auto' });
    setTimeout(() => next.classList.remove('is-entering'), 580);
  }, 260);
}

function openForm() {
  showScreen(registration, opening);
  setTimeout(() => document.getElementById('nama').focus({ preventScroll: true }), 560);
}

function returnToOpening(e) {
  if (e) e.preventDefault();
  showScreen(opening, registration);
  setTimeout(() => {
    goToSlide(0, false);
    startAutoplay();
  }, 350);
}

function updateProgress() {
  segments.forEach((segment, index) => {
    segment.classList.toggle('is-active', index === currentSlide);
    segment.classList.toggle('is-done', index < currentSlide);
    const fill = segment.querySelector('span');
    fill.style.animation = 'none';
    void fill.offsetWidth;
    if (index === currentSlide) fill.style.animation = `progressFill ${SLIDE_MS}ms linear forwards`;
  });
  currentSlideNumber.textContent = String(currentSlide + 1).padStart(2, '0');
}

function goToSlide(index, restart = true) {
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  currentSlide = index;
  storyTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  slides.forEach((slide, i) => slide.classList.toggle('is-current', i === currentSlide));
  updateProgress();
  if (restart) restartAutoplay();
}

function next() {
  if (currentSlide === slides.length - 1) {
    openForm();
  } else {
    goToSlide(currentSlide + 1);
  }
}

function prev() { goToSlide(currentSlide - 1); }

function startAutoplay() {
  stopAutoplay();
  timer = setInterval(() => {
    if (!opening.classList.contains('is-active')) return;
    if (currentSlide === slides.length - 1) {
      stopAutoplay();
      return;
    }
    goToSlide(currentSlide + 1, false);
  }, SLIDE_MS);
}
function stopAutoplay() { if (timer) clearInterval(timer); timer = null; }
function restartAutoplay() { startAutoplay(); }

nextSlide.addEventListener('click', next);
prevSlide.addEventListener('click', prev);
skipOpening.addEventListener('click', openForm);
startRegistration.addEventListener('click', openForm);
backToOpening.addEventListener('click', returnToOpening);
brandBack.addEventListener('click', returnToOpening);
segments.forEach((segment, i) => segment.addEventListener('click', () => goToSlide(i)));

document.addEventListener('keydown', (e) => {
  if (!opening.classList.contains('is-active')) return;
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'Enter' && currentSlide === slides.length - 1) openForm();
});

opening.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive:true });
opening.addEventListener('touchend', (e) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 48) return;
  delta < 0 ? next() : prev();
}, { passive:true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoplay();
  else if (opening.classList.contains('is-active') && currentSlide < slides.length - 1) startAutoplay();
});

function setError(el, message) {
  const field = el.closest('.field');
  if (!field) return;
  field.classList.toggle('invalid', Boolean(message));
  const error = field.querySelector('.error');
  if (error) error.textContent = message || '';
}

function validate() {
  const nama = document.getElementById('nama');
  const kelas = document.getElementById('kelas');
  const jurusan = document.getElementById('jurusan');
  const nohp = document.getElementById('nohp');
  const gender = document.querySelector('input[name="gender"]:checked');
  let valid = true;

  if (!nama.value.trim()) { setError(nama, 'Nama wajib diisi.'); valid = false; } else setError(nama, '');
  if (!kelas.value) { setError(kelas, 'Pilih kelas.'); valid = false; } else setError(kelas, '');
  if (!jurusan.value) { setError(jurusan, 'Pilih jurusan.'); valid = false; } else setError(jurusan, '');

  const phone = nohp.value.replace(/[^\d+]/g, '');
  if (!nohp.value.trim()) { setError(nohp, 'Nomor HP wajib diisi.'); valid = false; }
  else if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(phone)) { setError(nohp, 'Masukkan nomor HP yang valid.'); valid = false; }
  else setError(nohp, '');

  const genderError = document.getElementById('genderError');
  if (!gender) { genderError.textContent = 'Pilih gender.'; valid = false; } else genderError.textContent = '';

  if (!alasan.value.trim()) { setError(alasan, 'Alasan, minat, dan tujuan wajib diisi.'); valid = false; }
  else if (alasan.value.trim().length < 10) { setError(alasan, 'Tulis sedikit lebih lengkap.'); valid = false; }
  else setError(alasan, '');

  return valid;
}

alasan.addEventListener('input', () => {
  count.textContent = alasan.value.length;
  if (alasan.value.trim().length >= 10) setError(alasan, '');
});

document.querySelectorAll('input, select, textarea').forEach(el => {
  const clear = () => { if (el.value && el.closest('.field')) setError(el, ''); };
  el.addEventListener('input', clear);
  el.addEventListener('change', clear);
});
document.querySelectorAll('input[name="gender"]').forEach(el => el.addEventListener('change', () => document.getElementById('genderError').textContent = ''));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) {
    const firstInvalid = form.querySelector('.invalid input, .invalid select, .invalid textarea');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const nama = document.getElementById('nama').value.trim();
  const kelas = document.getElementById('kelas').value;
  const jurusan = document.getElementById('jurusan').value;
  const nohp = document.getElementById('nohp').value.trim();
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const alasanText = alasan.value.trim();

  const message = `*PENDAFTARAN EKSTRAKURIKULER ROHIS*\nSMK Pustek Serpong\n\n*Nama:* ${nama}\n*Kelas:* ${kelas}\n*Jurusan:* ${jurusan}\n*No. HP / WhatsApp:* ${nohp}\n*Gender:* ${gender}\n\n*Alasan, Minat & Tujuan:*\n${alasanText}\n\n_Pendaftaran dikirim melalui Web Rohis SMK Pustek Serpong._`;
  window.location.href = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
});

goToSlide(0, false);
startAutoplay();
