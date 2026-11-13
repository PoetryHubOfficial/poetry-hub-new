(() => {
  const cfg = window.POETRY_HUB_CONFIG || {};
  const ready = window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("PASTE_") && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const client = ready ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const grid = document.getElementById("galleryGrid");
  const status = document.getElementById("galleryStatus");
  const modal = document.getElementById("adminModal");
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const adminPanel = document.getElementById("adminPanel");
  let activeCategory = "";
  let allImages = [];
  let isAdmin = false;

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("adminOpen").addEventListener("click", () => modal.classList.remove("hidden"));
  document.getElementById("closeModal").addEventListener("click", () => modal.classList.add("hidden"));
  document.getElementById("menuBtn").addEventListener("click", () => document.getElementById("nav").classList.toggle("open"));
  document.querySelectorAll(".category").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
    btn.classList.add("active"); activeCategory = btn.dataset.category; renderGallery();
  }));

  function categoryFromPath(path) { return path.split("/")[0] || "sad"; }
  function renderGallery() {
  function renderGallery() {
  if (!activeCategory) {
    grid.innerHTML = "";
    status.textContent = "Choose a poetry category to begin.";
    return;
  }

  const visible = allImages.filter(x =>
    activeCategory === "all" || x.category === activeCategory
  );
    }
    if (!visible.length) {
      grid.innerHTML = '<div class="empty-state"><span>✧</span><h3>No images here yet</h3><p>New poetry images will appear in this collection.</p></div>';
      return;
    }
    grid.innerHTML = "";
    visible.forEach(item => {
      const card = document.createElement("article"); card.className = "poetry-card";
      const img = document.createElement("img"); img.src = item.url; img.alt = item.category + " poetry"; img.loading = "lazy";
      const foot = document.createElement("div"); foot.className = "card-foot";
      const label = document.createElement("span"); label.textContent = ({sad:"Sad Poetry",love:"Love Poetry",islamic:"Islamic Poetry"})[item.category] || "Poetry";
      const share = document.createElement("button"); share.textContent = "Share ↗";
      share.addEventListener("click", async () => {
        try {
          if (navigator.share) await navigator.share({title:"Poetry Hub", text:"Poetry from Poetry Hub", url:item.url});
          else { await navigator.clipboard.writeText(item.url); share.textContent = "Link copied"; }
        } catch (_) {}
      });
      foot.append(label, share);
      if (isAdmin) {
        const del = document.createElement("button");
        del.textContent = "Delete";
        del.addEventListener("click", async () => {
          if (!window.confirm("Delete this poetry image?")) return;
          const { error } = await client.storage.from(cfg.BUCKET).remove([item.path]);
          if (error) { alert("Delete failed: " + error.message); return; }
          await loadImages();
        });
        foot.append(del);
      }
      card.append(img, foot); grid.append(card);
    });
  }
  async function loadImages() {
    if (!client) {
      status.textContent = "Connect Supabase in config.js to load your gallery.";
      return;
    }
    status.textContent = "Loading poetry...";
    const { data, error } = await client.storage.from(cfg.BUCKET).list("", {limit:1000, sortBy:{column:"name", order:"desc"}});
    if (error) { status.textContent = "Could not load images: " + error.message; return; }
    const paths = [];
    for (const folder of (data || []).filter(x => x.id === null)) {
      const { data: nested, error: nestedError } = await client.storage.from(cfg.BUCKET).list(folder.name, {limit:1000});
      if (!nestedError) for (const f of nested || []) if (f.name && f.id) paths.push(folder.name + "/" + f.name);
    }
    // Also support files placed directly in the bucket root.
    for (const f of (data || []).filter(x => x.id)) paths.push(f.name);
    allImages = paths.map(path => {
      const { data: pub } = client.storage.from(cfg.BUCKET).getPublicUrl(path);
      return {path, url:pub.publicUrl, category:categoryFromPath(path)};
    }).filter(x => ["sad","love","islamic"].includes(x.category));
    status.textContent = allImages.length ? `${allImages.length} poetry image${allImages.length===1?"":"s"}` : "A little poetry for every mood.";
    renderGallery();
  }

  async function updateAdminUI() {
    if (!client) return;
    const { data } = await client.auth.getSession();
    const user = data.session?.user;
    isAdmin = !!user && !!cfg.ADMIN_UID && user.id === cfg.ADMIN_UID;
    loginForm.classList.toggle("hidden", !!user);
    adminPanel.classList.toggle("hidden", !isAdmin);
    if (user && !isAdmin) loginMessage.textContent = "This account is not authorized as the site admin.";
    else if (isAdmin) loginMessage.textContent = "Signed in as the authorized admin.";
    renderGallery();
  }

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!client) { loginMessage.textContent = "First add your Supabase URL and anon key in config.js."; return; }
    loginMessage.textContent = "Signing in...";
    const { error } = await client.auth.signInWithPassword({
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    });
    loginMessage.textContent = error ? error.message : "Signed in.";
    await updateAdminUI();
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await client.auth.signOut(); loginMessage.textContent = "Signed out."; await updateAdminUI();
  });

  document.getElementById("uploadBtn").addEventListener("click", async () => {
    const msg = document.getElementById("uploadMessage");
    const file = document.getElementById("imageFile").files[0];
    const category = document.getElementById("uploadCategory").value;
    if (!file) { msg.textContent = "Please choose an image first."; return; }
    if (file.size > 5 * 1024 * 1024) { msg.textContent = "Image must be 5 MB or smaller."; return; }
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) { msg.textContent = "Please use JPG, PNG, WEBP, or GIF."; return; }
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session || sessionData.session.user.id !== cfg.ADMIN_UID) { msg.textContent = "Admin login required."; return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${category}/${Date.now()}-${safeName}`;
    msg.textContent = "Uploading...";
    const { error } = await client.storage.from(cfg.BUCKET).upload(path, file, { upsert:false, contentType:file.type });
    msg.textContent = error ? "Upload failed: " + error.message : "Image uploaded successfully.";
    if (!error) { document.getElementById("imageFile").value = ""; await loadImages(); }
  });

  if (!client) {
    status.textContent = "Website design is ready. Supabase connection details still need to be added.";
    grid.innerHTML = '<div class="empty-state"><span>✧</span><h3>Welcome to Poetry Hub</h3><p>Once Supabase is connected, your poetry images will appear here.</p></div>';
  } else {
    loadImages(); updateAdminUI();
    client.auth.onAuthStateChange(() => updateAdminUI());
  }
})();
