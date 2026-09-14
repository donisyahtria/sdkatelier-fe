# Transisi Djiwaruang

Pola transisi diadaptasi dari [Markovskaia](https://markovskaia.ru/en/), berdasarkan pengamatan di browser serta atribut animasi publiknya. Implementasi React ditulis untuk struktur dan konten Djiwaruang; bukan salinan tema WordPress referensi.

| Area                   | Perilaku                                                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pembuka                | Dua bagian nama naik dari bawah melalui mask; metadata menyusul 400/600 ms. Hero fade-in dari posisi 50 px lebih rendah.                                                                             |
| Hero ke About          | Judul tipis melintasi tepi bawah hero, disambung judul besar dengan reveal per baris.                                                                                                                |
| About                  | Dua foto memakai zoom-out 1.22 → 1, disertai pergeseran parallax kecil.                                                                                                                              |
| Projects               | Judul muncul per baris. Foto mengikuti parallax sangat halus; hover memperbesar foto. Baris proyek tidak diberi fade besar karena pada referensi fotonya menggunakan parallax tanpa entrance reveal. |
| Services               | Judul muncul per baris. Daftar layanan tetap stabil dan accordion tetap dapat dipakai.                                                                                                               |
| Journal                | Foto zoom-out dan parallax; teks berulang bergerak ke kanan dalam siklus 30 detik, dengan tambahan offset horizontal mengikuti scroll.                                                               |
| Other pages dan footer | Tautan Projects serta teks kontak naik melalui mask.                                                                                                                                                 |

## Pengaturan

- `src/motion.css`: `--reveal-time` 1.3 detik desktop / 1 detik mobile; `--reveal-ease: cubic-bezier(0.12, 0.75, 0.4, 1)`.
- `RevealLine`: prop `delay` dalam milidetik; mask terpisah dari anak yang bergerak agar layout tetap stabil.
- `MotionImage`: prop `zoom={false}` untuk foto proyek; lapisan parallax, entrance zoom, dan hover dipisahkan agar transform tidak saling menimpa.
- `usePageMotion`: reveal dimulai ketika elemen masuk 92% tinggi viewport. Parallax maksimal ±26 px desktop / ±10 px mobile. Lenis menggunakan `lerp: 0.085`.
- Elemen baru dari filter, tombol More Projects, atau pembaruan CMS didaftarkan otomatis. Elemen yang dilepas dibersihkan dari observer.

Pengukuran parallax hanya dilakukan pada elemen di sekitar viewport. Pembacaan posisi dan perubahan style dipisahkan dalam satu requestAnimationFrame. Observer, listener, dan Lenis dibersihkan saat unmount atau saat preferensi gerakan berubah. Modal menghentikan inertia latar belakang dan memakai scroll internal bawaan browser.

`prefers-reduced-motion` menonaktifkan entrance, smooth scrolling, parallax, serta marquee. Animasi marquee dijeda ketika di luar viewport atau saat diarahkan pointer. Hero memiliki kontrol pause/play sendiri.

## Validasi

Build produksi, pembuka dari keadaan tersembunyi, pemicu judul saat scroll, parallax, filter proyek, modal dan penguncian scroll latar belakang, seluruh section sampai footer, navigasi mobile, dan preferensi mengurangi gerakan diperiksa di Edge headless. Layout diperiksa pada lebar 320, 390, 768, dan 1440 px.

Durasi dan posisi reveal diadaptasi untuk panjang teks serta ukuran section Djiwaruang; kesamaan frame-per-frame dengan referensi tidak diklaim.
