// ============================================================
// STATE
// ============================================================
const state = {
  currentUser: null, // { nama, email, pass, sekolah, hp, alamat, profilLengkap, bayarUploaded, status }
  accounts: [],      // daftar akun yang sudah registrasi
  pesertaList: [],
  selectedPeserta: null
};

// ============================================================
// PAGE NAVIGATION
// ============================================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ============================================================
// REGISTER
// ============================================================
function doRegister() {
  const nama  = document.getElementById('reg-nama').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  if (!nama || !email || !pass || !pass2) { alert('Semua field harus diisi!'); return; }
  if (pass !== pass2) { alert('Password tidak cocok!'); return; }
  if (pass.length < 6) { alert('Password minimal 6 karakter!'); return; }

  fetch('api/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama, email, password: pass })
  })
  .then(res => res.json())
  .then(result => {
    if (!result.success) { alert(result.message); return; }

    const akun = { nama, email, sekolah:'', hp:'', alamat:'', profilLengkap:false, bayarUploaded:false, status:'belum', bayarFile:null };
    state.accounts.push(akun);
    state.currentUser = akun;

    loadDashboard();
    showPage('page-dashboard');
    showToast('Akun berhasil dibuat!');
  })
  .catch(err => alert('Terjadi kesalahan: ' + err));
}

// ============================================================
// LOGIN PESERTA
// ============================================================
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { alert('Email dan password harus diisi!'); return; }

  fetch('api/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  })
  .then(res => res.json())
  .then(result => {
    if (!result.success) { alert(result.message); return; }

state.currentUser = {
  nama: result.data.nama,
  email: result.data.email,
  sekolah: result.data.sekolah || '',
  hp: result.data.nomor_hp || '',
  alamat: result.data.alamat || '',
  bidang: result.data.bidang || '',
  profilLengkap: result.data.profil_lengkap == 1,
  bayarUploaded: !!result.data.bayar_file,
  status: result.data.status,
  bayarFile: result.data.bayar_file || null
};

    loadDashboard();
    showPage('page-dashboard');
    showToast('Login berhasil!');
  })
  .catch(err => alert('Terjadi kesalahan: ' + err));
}
function doLogout() {
  state.currentUser = null;
  showPage('page-landing');
}
// ============================================================
// DASHBOARD
// ============================================================
function loadDashboard() {
  const u = state.currentUser;
  document.getElementById('sidebar-name').textContent = u.nama;
  document.getElementById('wc-name').textContent = u.nama;
  // Pre-fill profil
  document.getElementById('p-nama').value = u.nama;
  document.getElementById('p-sekolah').value = u.sekolah;
  document.getElementById('p-hp').value = u.hp;
  document.getElementById('p-alamat').value = u.alamat;
  document.getElementById('p-bidang').value = u.bidang || '';
  updateDashState();
}

function updateDashState() {
  const u = state.currentUser;
  const statusBadge = document.getElementById('status-badge');
  const progressFill = document.getElementById('progress-fill');
  const progressPct = document.getElementById('progress-pct');
  const dashInfo = document.getElementById('dash-info');

  // Reset inline style supaya tidak menumpuk dari kondisi status sebelumnya
  statusBadge.removeAttribute('style');
  dashInfo.removeAttribute('style');

  // Checklist items
  const ciProfil = document.getElementById('ci-profil');
  const ccProfil = document.getElementById('cc-profil');
  const ciProfilDesc = document.getElementById('ci-profil-desc');
  const ciProfilBtn = document.getElementById('ci-profil-btn');
  const ciBayar = document.getElementById('ci-bayar');
  const ccBayar = document.getElementById('cc-bayar');
  const ciBayarDesc = document.getElementById('ci-bayar-desc');
  const ciBayarBtn = document.getElementById('ci-bayar-btn');

  if (!u.profilLengkap && !u.bayarUploaded) {
    // 0%
    progressFill.style.width = '0%';
    progressPct.textContent = '0%';
    statusBadge.className = 'badge badge-orange';
    statusBadge.textContent = 'Belum Lengkap';
    ciProfil.style.borderColor = 'var(--orange)';
    ciProfil.classList.remove('done-item');
    ccProfil.className = 'check-circle';
    ccProfil.textContent = '';
    ciProfilDesc.textContent = 'Lengkapi data profil Anda (Nama, Sekolah, No HP, Alamat)';
    ciProfilBtn.classList.remove('hidden');
    ciBayar.classList.remove('done-item');
    ciBayar.style.borderColor = 'var(--border)';
    ccBayar.className = 'check-circle';
    ccBayar.textContent = '';
    ciBayarDesc.textContent = 'Lengkapi profil terlebih dahulu';
    ciBayarBtn.classList.add('hidden');
    dashInfo.className = 'alert alert-orange';
    dashInfo.textContent = 'Silakan lengkapi data profil Anda untuk melanjutkan proses pendaftaran.';
  } else if (u.profilLengkap && !u.bayarUploaded) {
    // 50%
    progressFill.style.width = '50%';
    progressPct.textContent = '50%';
    statusBadge.className = 'badge badge-blue';
    statusBadge.textContent = 'Profil Lengkap';
    ciProfil.classList.add('done-item');
    ciProfil.style.borderColor = '#BBF7D0';
    ccProfil.className = 'check-circle checked';
    ccProfil.textContent = '✓';
    ciProfilDesc.textContent = 'Profil lengkap telah diisi';
    ciProfilBtn.classList.add('hidden');
    ciBayar.classList.remove('done-item');
    ciBayar.style.borderColor = 'var(--orange)';
    ccBayar.className = 'check-circle';
    ccBayar.textContent = '';
    ciBayarDesc.textContent = 'Upload bukti pembayaran pendaftaran';
    ciBayarBtn.classList.remove('hidden');
    dashInfo.className = 'alert alert-orange';
    dashInfo.textContent = 'Silakan upload bukti pembayaran untuk menyelesaikan pendaftaran.';
  } else if (u.profilLengkap && u.bayarUploaded && u.status === 'diterima') {
    // 100% - DITERIMA
    progressFill.style.width = '100%';
    progressPct.textContent = '100%';
    statusBadge.className = 'badge badge-green';
    statusBadge.textContent = 'Diterima';
    ciProfil.classList.add('done-item');
    ciProfil.style.borderColor = '#BBF7D0';
    ccProfil.className = 'check-circle checked';
    ccProfil.textContent = '✓';
    ciProfilDesc.textContent = 'Profil lengkap telah diisi';
    ciProfilBtn.classList.add('hidden');
    ciBayar.classList.add('done-item');
    ciBayar.style.borderColor = '#BBF7D0';
    ccBayar.className = 'check-circle checked';
    ccBayar.textContent = '✓';
    ciBayarDesc.textContent = 'Bukti pembayaran telah diupload';
    ciBayarBtn.classList.add('hidden');
    dashInfo.className = 'alert alert-blue';
    dashInfo.style.background = '#F0FDF4';
    dashInfo.style.color = '#166534';
    dashInfo.innerHTML = 'Selamat! Pendaftaran Anda telah diterima. Silakan hubungi <a href="https://wa.me/62811123456" target="_blank" style="font-weight:600;text-decoration:underline;">Admin Panitia (+62 811 123 456)</a> untuk konfirmasi kehadiran dan informasi teknis pelaksanaan. Sampai jumpa di kompetisi!';
  } else if (u.profilLengkap && u.bayarUploaded && u.status === 'ditolak') {
    // 100% - DITOLAK
    progressFill.style.width = '100%';
    progressPct.textContent = '100%';
    statusBadge.className = 'badge';
    statusBadge.style.background = '#FEF2F2';
    statusBadge.style.color = 'var(--red)';
    statusBadge.textContent = 'Ditolak';
    ciProfil.classList.add('done-item');
    ciProfil.style.borderColor = '#BBF7D0';
    ccProfil.className = 'check-circle checked';
    ccProfil.textContent = '✓';
    ciProfilDesc.textContent = 'Profil lengkap telah diisi';
    ciProfilBtn.classList.add('hidden');
    ciBayar.classList.add('done-item');
    ciBayar.style.borderColor = '#BBF7D0';
    ccBayar.className = 'check-circle checked';
    ccBayar.textContent = '✓';
    ciBayarDesc.textContent = 'Bukti pembayaran telah diupload';
    ciBayarBtn.classList.add('hidden');
    dashInfo.className = 'alert';
    dashInfo.style.background = '#FEF2F2';
    dashInfo.style.color = 'var(--red)';
    dashInfo.innerHTML = 'Mohon maaf, pendaftaran Anda belum dapat kami terima pada periode ini. Jangan berkecil hati — silakan hubungi <a href="https://wa.me/62811123456" target="_blank" style="font-weight:600;text-decoration:underline;">Admin Panitia (+62 811 123 456)</a> jika ada pertanyaan, dan tetap semangat untuk kesempatan berikutnya!';
  } else if (u.profilLengkap && u.bayarUploaded) {
    // 100% - MENUNGGU
    progressFill.style.width = '100%';
    progressPct.textContent = '100%';
    statusBadge.className = 'badge badge-yellow';
    statusBadge.textContent = 'Menunggu Verifikasi';
    ciProfil.classList.add('done-item');
    ciProfil.style.borderColor = '#BBF7D0';
    ccProfil.className = 'check-circle checked';
    ccProfil.textContent = '✓';
    ciProfilDesc.textContent = 'Profil lengkap telah diisi';
    ciProfilBtn.classList.add('hidden');
    ciBayar.classList.add('done-item');
    ciBayar.style.borderColor = '#BBF7D0';
    ccBayar.className = 'check-circle checked';
    ccBayar.textContent = '✓';
    ciBayarDesc.textContent = 'Bukti pembayaran telah diupload';
    ciBayarBtn.classList.add('hidden');
    dashInfo.className = 'alert alert-blue';
    dashInfo.textContent = 'Pendaftaran Anda sedang dalam proses verifikasi. Kami akan menghubungi Anda segera.';
  }
}

function switchTab(tab) {
  document.getElementById('tab-dashboard').classList.add('hidden');
  document.getElementById('tab-profil').classList.add('hidden');
  document.getElementById('tab-pembayaran').classList.add('hidden');
  document.getElementById('nav-dashboard').classList.remove('active');
  document.getElementById('nav-profil').classList.remove('active');
  document.getElementById('nav-pembayaran').classList.remove('active');

  document.getElementById('tab-' + tab).classList.remove('hidden');
  document.getElementById('nav-' + tab).classList.add('active');

  if (tab === 'pembayaran') {
    renderPembayaranTab();
  }
}

function renderPembayaranTab() {
  const u = state.currentUser;
  const existingBox = document.getElementById('bayar-existing');
  const uploadArea = document.getElementById('upload-area');
  const btnRow = document.getElementById('bayar-btn-row');

  if (u && u.bayarUploaded && u.bayarFile) {
    const ext = u.bayarFile.split('.').pop().toLowerCase();
    const fileUrl = 'uploads/' + u.bayarFile;
    let preview = '';
    if (ext === 'pdf') {
      preview = `<a href="${fileUrl}" target="_blank" style="color:var(--orange,#f97316);font-weight:500;">${u.bayarFile} (Buka PDF)</a>`;
    } else {
      preview = `<img src="${fileUrl}" style="max-width:200px;border-radius:8px;border:1px solid var(--border);display:block;margin-top:8px;" />`;
    }
    existingBox.innerHTML = `
      <div style="padding:12px;background:var(--gray-bg);border-radius:8px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Bukti pembayaran sudah diupload</div>
        <div style="font-size:13px;color:var(--text-gray);margin-bottom:8px;">Status: ${u.status}</div>
        ${preview}
      </div>
      <button class="btn btn-outline" style="margin-top:12px;" onclick="showGantiBukti()">Ganti Bukti Pembayaran</button>`;
    existingBox.classList.remove('hidden');
    uploadArea.classList.add('hidden');
    if (btnRow) btnRow.classList.add('hidden');
  } else {
    existingBox.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    if (btnRow) btnRow.classList.remove('hidden');
  }
}

function showGantiBukti() {
  document.getElementById('bayar-existing').classList.add('hidden');
  document.getElementById('upload-area').classList.remove('hidden');
  const btnRow = document.getElementById('bayar-btn-row');
  if (btnRow) btnRow.classList.remove('hidden');
}

// ============================================================
// PROFIL
// ============================================================
function saveProfil() {
  const nama    = document.getElementById('p-nama').value.trim();
  const sekolah = document.getElementById('p-sekolah').value.trim();
  const hp      = document.getElementById('p-hp').value.trim();
  const alamat  = document.getElementById('p-alamat').value.trim();
  const bidang  = document.getElementById('p-bidang').value.trim();
  if (!nama || !sekolah || !hp || !alamat || !bidang) { alert('Semua field harus diisi!'); return; }

  fetch('api/update_profil.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: state.currentUser.email,
      nama, sekolah, nomor_hp: hp, alamat, bidang
    })
  })
  .then(res => res.json())
  .then(result => {
    if (!result.success) { alert(result.message); return; }

    state.currentUser.nama    = nama;
    state.currentUser.sekolah = sekolah;
    state.currentUser.hp      = hp;
    state.currentUser.alamat  = alamat;
    state.currentUser.bidang  = bidang;
    state.currentUser.profilLengkap = true;

    updateOrAddPeserta();
    document.getElementById('sidebar-name').textContent = nama;
    document.getElementById('wc-name').textContent = nama;
    updateDashState();
    switchTab('dashboard');
    showToast('Profil berhasil disimpan!');
  })
  .catch(() => alert('Gagal terhubung ke server.'));
}

function updateOrAddPeserta() {
  const u = state.currentUser;
  const idx = state.pesertaList.findIndex(p => p.email === u.email);
  const entry = { nama: u.nama, email: u.email, sekolah: u.sekolah, hp: u.hp, alamat: u.alamat, status: u.status, bayarFile: u.bayarFile || null };
  if (idx >= 0) state.pesertaList[idx] = entry;
  else state.pesertaList.push(entry);
}

// ============================================================
// PEMBAYARAN
// ============================================================
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('file-name').textContent = file.name;
  document.getElementById('upload-area').classList.add('hidden');
  document.getElementById('file-preview').classList.remove('hidden');
  state.currentUser.bayarFile = file.name;
}

function removeFile() {
  document.getElementById('file-input').value = '';
  document.getElementById('upload-area').classList.remove('hidden');
  document.getElementById('file-preview').classList.add('hidden');
  state.currentUser.bayarFile = null;
}

function uploadBayar() {
  if (!state.currentUser.profilLengkap) { alert('Harap lengkapi profil terlebih dahulu!'); return; }

  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (!file) {
    alert('Harap pilih file bukti pembayaran!'); return;
  }

  const formData = new FormData();
  formData.append('email', state.currentUser.email);
  formData.append('bukti', file);

  fetch('api/upload_bayar.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(result => {
    if (!result.success) { alert(result.message); return; }

    state.currentUser.bayarFile = result.filename;
    state.currentUser.bayarUploaded = true;
    state.currentUser.status = 'menunggu';
    updateOrAddPeserta();
    updateDashState();
    switchTab('dashboard');
    showToast('Bukti pembayaran berhasil diupload');
  })
  .catch(() => alert('Gagal terhubung ke server.'));
}
// ============================================================
// ADMIN LOGIN
// ============================================================
function doAdminLogin() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  if (!user || !pass) { alert('Username dan password harus diisi!'); return; }

  fetch('api/admin_login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password: pass })
  })
  .then(res => res.json())
  .then(result => {
    if (!result.success) { alert(result.message); return; }
    showPage('page-admin-dashboard');
    fetchPesertaList();
    showToast('Login Admin berhasil!');
  })
  .catch(() => alert('Gagal terhubung ke server.'));
}

function doAdminLogout() {
  showPage('page-landing');
}

// ============================================================
// ADMIN TABLE
// ============================================================
function fetchPesertaList() {
  fetch('api/get_peserta.php')
    .then(res => res.json())
    .then(result => {
      if (!result.success) { alert('Gagal memuat data peserta'); return; }
      state.pesertaList = result.data;
      renderAdminTable();
    })
    .catch(() => alert('Gagal terhubung ke server.'));
}

function renderAdminTable() {
  const tbody = document.getElementById('peserta-tbody');
  tbody.innerHTML = '';
  let menunggu = 0, disetujui = 0;
  state.pesertaList.forEach((p) => {
    if (p.status === 'menunggu') menunggu++;
    if (p.status === 'diterima') disetujui++;
    const statusHtml = statusBadgeHtml(p.status);
    const aksiHtml = buildAksiHtml(p.id, p.status);
    tbody.innerHTML += `
      <tr>
        <td><strong>${p.nama}</strong></td>
        <td>${p.sekolah || '-'}</td>
        <td>${p.hp || '-'}</td>
        <td>${statusHtml}</td>
        <td style="text-align:right;">
          <div class="action-btns" style="justify-content:flex-end;">${aksiHtml}</div>
        </td>
      </tr>`;
  });
  document.getElementById('stat-total').textContent = state.pesertaList.length;
  document.getElementById('stat-menunggu').textContent = menunggu;
  document.getElementById('stat-disetujui').textContent = disetujui;
  if (state.pesertaList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-gray);padding:24px;">Belum ada peserta terdaftar</td></tr>';
  }
}

function statusBadgeHtml(status) {
  const map = {
    belum: '<span class="badge badge-orange">Belum Lengkap</span>',
    menunggu: '<span class="badge badge-yellow">Menunggu</span>',
    diterima: '<span class="badge badge-green">Diterima</span>',
    ditolak: '<span class="badge" style="background:#FEF2F2;color:var(--red);">Ditolak</span>'
  };
  return map[status] || '';
}

function buildAksiHtml(id, status) {
  let html = `<button class="btn-sm view" onclick="viewDetail(${id})"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg> Lihat</button>`;
  if (status === 'menunggu') {
    html += `<button class="btn-sm approve" onclick="quickApprove(${id})"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> Setujui</button>`;
    html += `<button class="btn-sm reject" onclick="quickReject(${id})"><svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg> Tolak</button>`;
  }
  html += `<button class="btn-icon" onclick="deletePeserta(${id})"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>`;
  return html;
}

function updateStatusServer(id, status) {
  return fetch('api/update_status.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  }).then(res => res.json());
}

function quickApprove(id) {
  updateStatusServer(id, 'diterima').then(result => {
    if (!result.success) { alert(result.message); return; }
    fetchPesertaList();
    showToast('Peserta berhasil disetujui!');
  }).catch(() => alert('Gagal terhubung ke server.'));
}

function quickReject(id) {
  updateStatusServer(id, 'ditolak').then(result => {
    if (!result.success) { alert(result.message); return; }
    fetchPesertaList();
    showToast('Peserta ditolak.');
  }).catch(() => alert('Gagal terhubung ke server.'));
}

function deletePeserta(id) {
  if (!confirm('Hapus peserta ini?')) return;
  fetch('api/delete_peserta.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(result => {
    if (!result.success) { alert(result.message); return; }
    fetchPesertaList();
    showToast('Peserta dihapus.');
  })
  .catch(() => alert('Gagal terhubung ke server.'));
}

// ============================================================
// ADMIN DETAIL
// ============================================================
function viewDetail(id) {
  state.selectedPeserta = id;
  const p = state.pesertaList.find(x => x.id === id);
  if (!p) return;
  document.getElementById('d-nama').textContent = p.nama || '-';
  document.getElementById('d-email').textContent = p.email || '-';
  document.getElementById('d-sekolah').textContent = p.sekolah || '-';
  document.getElementById('d-hp').textContent = p.hp || '-';
  document.getElementById('d-alamat').textContent = p.alamat || '-';

  // Status badge
  const sb = document.getElementById('detail-status-badge');
  sb.innerHTML = statusBadgeHtml(p.status);

  // Bukti
  const bc = document.getElementById('bukti-container');
  if (p.bayarFile) {
    const ext = p.bayarFile.split('.').pop().toLowerCase();
    const fileUrl = 'uploads/' + p.bayarFile;
    if (ext === 'pdf') {
      bc.innerHTML = `
        <div style="margin-top:12px;display:flex;align-items:center;gap:8px;padding:10px;background:var(--gray-bg);border-radius:8px;">
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-gray);"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          <a href="${fileUrl}" target="_blank" style="font-size:14px;font-weight:500;color:var(--orange,#f97316);">${p.bayarFile} (Buka PDF)</a>
        </div>`;
    } else {
      bc.innerHTML = `
        <div style="text-align:center;">
          <img src="${fileUrl}" alt="Bukti Pembayaran" onclick="openImageLightbox('${fileUrl}')" style="max-width:100%;max-height:400px;border-radius:8px;border:1px solid var(--border);cursor:zoom-in;" />
          <div style="margin-top:8px;font-size:13px;color:var(--text-gray);">${p.bayarFile}</div>
        </div>`;
    }
  } else {
    bc.textContent = 'Belum ada bukti pembayaran diupload';
  }

  // Verif section
  const verifSection = document.getElementById('verif-section');
  const approvedMsg = document.getElementById('approved-msg');
  const rejectedMsg = document.getElementById('rejected-msg');
  if (p.status === 'menunggu') {
    verifSection.classList.remove('hidden');
    approvedMsg.classList.add('hidden');
    rejectedMsg.classList.add('hidden');
  } else if (p.status === 'diterima') {
    verifSection.classList.add('hidden');
    approvedMsg.classList.remove('hidden');
    rejectedMsg.classList.add('hidden');
  } else if (p.status === 'ditolak') {
    verifSection.classList.add('hidden');
    approvedMsg.classList.add('hidden');
    rejectedMsg.classList.remove('hidden');
  } else {
    verifSection.classList.add('hidden');
    approvedMsg.classList.add('hidden');
    rejectedMsg.classList.add('hidden');
  }

  showPage('page-admin-detail');
}

function approveParticipant() {
  const id = state.selectedPeserta;
  if (id === null) return;
  updateStatusServer(id, 'diterima').then(result => {
    if (!result.success) { alert(result.message); return; }
    document.getElementById('verif-section').classList.add('hidden');
    document.getElementById('approved-msg').classList.remove('hidden');
    document.getElementById('rejected-msg').classList.add('hidden');
    document.getElementById('detail-status-badge').innerHTML = statusBadgeHtml('diterima');
    fetchPesertaList();
    showToast('Peserta berhasil disetujui!');
  }).catch(() => alert('Gagal terhubung ke server.'));
}

function rejectParticipant() {
  const id = state.selectedPeserta;
  if (id === null) return;
  updateStatusServer(id, 'ditolak').then(result => {
    if (!result.success) { alert(result.message); return; }
    document.getElementById('verif-section').classList.add('hidden');
    document.getElementById('approved-msg').classList.add('hidden');
    document.getElementById('rejected-msg').classList.remove('hidden');
    document.getElementById('detail-status-badge').innerHTML = statusBadgeHtml('ditolak');
    fetchPesertaList();
    showToast('Peserta ditolak.');
  }).catch(() => alert('Gagal terhubung ke server.'));
}

// ============================================================
// IMAGE LIGHTBOX (perbesar gambar bukti pembayaran)
// ============================================================
function openImageLightbox(url) {
  let overlay = document.getElementById('img-lightbox-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'img-lightbox-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;padding:20px;box-sizing:border-box;';
    overlay.onclick = closeImageLightbox;

    const img = document.createElement('img');
    img.id = 'img-lightbox-img';
    img.style.cssText = 'max-width:95%;max-height:95%;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.5);';
    overlay.appendChild(img);

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:absolute;top:20px;right:30px;color:#fff;font-size:36px;font-weight:300;cursor:pointer;line-height:1;';
    closeBtn.onclick = closeImageLightbox;
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);
  }
  document.getElementById('img-lightbox-img').src = url;
  overlay.style.display = 'flex';
}

function closeImageLightbox() {
  const overlay = document.getElementById('img-lightbox-overlay');
  if (overlay) overlay.style.display = 'none';
}