# Djiwaruang Studio

Landing page React + Vite, dengan desain editorial yang mengikuti referensi: warna putih hangat, tipografi besar, fotografi interior, dan susunan proyek asimetris. Responsif untuk desktop dan mobile.

## Menjalankan

```bash
npm install
npm run dev
```

Pada PowerShell yang memblokir `npm.ps1`, gunakan `npm.cmd install` dan `npm.cmd run dev`.

```bash
npm run build
npm run preview
```

## Konten dan komponen

- `src/data/content.js`: seluruh contoh konten utama, alamat email, proyek, layanan, serta konfigurasi hero.
- `src/App.jsx`: komponen Header, Hero, About, Projects, Services, Journal, dan Footer.
- `src/components/ProjectDialog.jsx`: popup galeri proyek, navigasi thumbnail/keyboard, dan swipe.
- `src/project-gallery.css`: layout galeri desktop dan popup layar penuh di mobile.
- `src/lib/content.js`: pembacaan dan validasi konten dari API CMS, dengan konten lokal sebagai fallback.
- `src/styles.css`: layout responsif.
- `src/components/Motion.jsx`: komponen mask teks dan lapisan gambar.
- `src/hooks/usePageMotion.js`: scroll halus, pemicu reveal, dan parallax.
- `src/motion.css`: durasi, easing, marquee, dan dukungan `prefers-reduced-motion`.
- `public/images/`: foto contoh yang disimpan lokal.

Nama proyek, lokasi, deskripsi, dan alamat `hello@djiwaruang.studio` adalah placeholder untuk ditinjau/diganti sebelum publikasi. Tombol kontak membuka aplikasi email; belum ada pengiriman formulir melalui backend. Tautan Instagram hanya ditampilkan jika `studio.instagramUrl` diisi dengan URL valid. Foto contoh berasal dari Unsplash, bukan dokumentasi proyek studio.

## Animasi nama dan hero

Nama studio mula-mula tidak terlihat secara visual, tetapi tetap memiliki nama aksesibel. Kata-katanya muncul dari bawah melalui mask setelah 200–300 ms, mengikuti pola situs referensi. Metadata menyusul setelah 400–600 ms, lalu hero masuk dengan fade dan pergeseran halus. Pengunjung dengan preferensi mengurangi gerakan langsung melihat tulisan tanpa animasi.

Transisi section memakai reveal per baris saat memasuki viewport, zoom-out pada foto About/Journal, parallax ringan pada foto, serta marquee horizontal di Journal. Smooth scroll menggunakan Lenis; touch tetap mengikuti scroll bawaan perangkat. Reveal hanya berjalan sekali untuk tiap elemen, sedangkan parallax mengikuti scroll dua arah. Detail konfigurasi dan catatan pencocokan ada di [docs/motion.md](docs/motion.md).

Hero default menggunakan foto dengan gerakan zoom/pan halus. Tombol pause/play mengontrol gerakan. Untuk mengganti menjadi video, taruh file di `public/media/` dan ubah `hero.media`:

```js
{
  type: 'video',
  src: '/media/studio.mp4',
  poster: '/images/hero.jpg',
  alt: 'Video interior Djiwaruang Studio'
}
```

Video memakai `muted`, `loop`, dan `playsInline`. Autoplay mengikuti kebijakan browser dan preferensi mengurangi gerakan. Jika autoplay diblokir, tersedia tombol play. Jika video gagal dimuat, halaman menampilkan poster.

Untuk GIF gunakan `type: 'gif'` dan `src: '/media/studio.gif'`. Sertakan `poster` berupa gambar diam: pause GIF dilakukan dengan menggantinya ke poster. Video MP4 lebih sesuai untuk media panjang. Tanpa poster, GIF yang dijeda menampilkan bidang diam.

## Galeri proyek dalam popup

`project.images` berisi semua foto galeri dalam urutan tampil. Homepage hanya mengambil dua foto pertama; menambahkan foto detail tidak menambah kolom di homepage. Rumah Sela memiliki enam foto contoh untuk mencoba galeri.

Popup menampilkan satu foto besar tanpa memotong proporsi gambar, thumbnail horizontal, dan penanda posisi foto. Navigasi tersedia melalui tombol sebelumnya/berikutnya, tombol keyboard kiri/kanan, thumbnail, dan swipe horizontal pada layar sentuh. Setelah foto terakhir, navigasi kembali ke foto pertama. Proyek dengan satu foto tidak menampilkan tombol navigasi atau thumbnail.

Nama proyek dan tombol tutup tetap di atas saat popup digulir. Mobile memakai layar penuh; scroll vertikal dan pinch-zoom tetap tersedia. Tombol Escape menutup popup dan fokus kembali ke pemicunya. Membuka ulang proyek memulai dari foto pertama. Galeri juga menyediakan status saat gambar dimuat atau gagal dimuat.

## Menyambungkan CMS

Backend dan panel login admin **belum termasuk tahap halaman awal ini**. Frontend sudah menyediakan kontrak konten sehingga tidak perlu mengubah layout saat CMS tersedia.

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `VITE_CMS_CONTENT_URL=https://backend-anda/api/site-content`.
3. Endpoint GET mengembalikan objek JSON dengan struktur sama seperti `defaultContent` di `src/data/content.js`. Contoh JSON tersedia di `docs/cms-content.example.json`.
4. Aktifkan CORS untuk origin frontend jika backend terpisah. URL media dari CMS harus URL HTTPS lengkap atau path pada origin frontend.
5. Jalankan ulang Vite setelah mengganti environment variable; untuk produksi, build ulang.

Frontend membaca endpoint saat halaman dibuka. Jika endpoint gagal, formatnya tidak sesuai, atau melewati batas 8 detik, halaman tetap memakai konten lokal. Kategori proyek yang didukung: `Residential` dan `Commercial`. Field `year` berupa string.

Untuk rencana satu admin, autentikasi, pembuatan akun admin tunggal, izin upload/edit/publish, serta validasi file harus ditangani di backend CMS. Endpoint baca konten yang sudah dipublikasikan dapat diakses publik. Jangan menyimpan password, token admin, atau kunci rahasia dalam variabel `VITE_*` karena isinya masuk ke bundle browser. Tidak ada registrasi pengguna di landing page ini.

## Sumber foto contoh

Foto diunduh dari `images.unsplash.com` dengan ID berikut:

| File          | ID foto                          |
| ------------- | -------------------------------- |
| hero.jpg      | photo-1600210492486-724fe5c67fb0 |
| living.jpg    | photo-1600607687920-4e2a09cf159d |
| bedroom.jpg   | photo-1616486338812-3dadae4b4ace |
| detail.jpg    | photo-1494438639946-1ebd1d20bf85 |
| curtain.jpg   | photo-1616486029423-aaa4789e8c9a |
| cafe.jpg      | photo-1554118811-1e0d58224f24    |
| dining.jpg    | photo-1600210491892-03d54c0aaf87 |
| workspace.jpg | photo-1497366754035-f200968a6e72 |
