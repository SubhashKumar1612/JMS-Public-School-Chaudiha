import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/api";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

const tabs = ["overview", "messages", "gallery", "notices", "events", "content"];

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [gallery, setGallery] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [content, setContent] = useState({});
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploadTitle, setUploadTitle] = useState("School Moment");
  const [admissionTemplateFile, setAdmissionTemplateFile] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);

  const [noticeForm, setNoticeForm] = useState({ title: "", description: "", date: "", isPinned: false });
  const [eventForm, setEventForm] = useState({ title: "", description: "", eventDate: "", location: "JMS Campus" });

  const stats = useMemo(() => ({
    galleryCount: gallery.length,
    noticeCount: notices.length,
    eventCount: events.length,
    messageCount: messages.length,
  }), [gallery.length, notices.length, events.length, messages.length]);

  // Loads all admin-managed resources in one dashboard refresh
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [gRes, nRes, eRes, cRes, mRes] = await Promise.all([
        api.get("/gallery"),
        api.get("/notices"),
        api.get("/events"),
        api.get("/content"),
        api.get("/contact/messages"),
      ]);

      setGallery(gRes.data || []);
      setNotices(nRes.data || []);
      setEvents(eRes.data || []);
      setContent(cRes.data || {});
      setMessages(mRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!messages.length) {
      setSelectedMessage(null);
      return;
    }

    setSelectedMessage((current) => {
      if (!current) return messages[0];
      return messages.find((m) => m._id === current._id) || messages[0];
    });
  }, [messages]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreview(selected.map((file) => URL.createObjectURL(file)));
  };

  // Uploads multiple images with preview support and auto-refresh
  const handleUpload = async () => {
    if (!files.length) return toast.error("Please select images.");
    const fd = new FormData();
    fd.append("title", uploadTitle);
    files.forEach((file) => fd.append("images", file));

    try {
      await api.post("/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Photos uploaded successfully.");
      setFiles([]);
      setPreview([]);
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.");
    }
  };

  const deleteGalleryItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success("Photo deleted.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed.");
    }
  };

  const createNotice = async () => {
    if (!noticeForm.title || !noticeForm.description) return toast.error("Notice title and description required.");
    try {
      await api.post("/notices", noticeForm);
      setNoticeForm({ title: "", description: "", date: "", isPinned: false });
      toast.success("Notice added.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add notice.");
    }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice deleted.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete notice.");
    }
  };

  const createEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.eventDate) return toast.error("Title, description and date are required.");
    try {
      await api.post("/events", eventForm);
      setEventForm({ title: "", description: "", eventDate: "", location: "JMS Campus" });
      toast.success("Event added.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add event.");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event.");
    }
  };

  const saveContent = async () => {
    try {
      await api.put("/content", content);
      toast.success("School content updated.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save content.");
    }
  };

  const uploadAdmissionTemplate = async () => {
    if (!admissionTemplateFile) return toast.error("Please choose a template file.");

    const fd = new FormData();
    fd.append("template", admissionTemplateFile);

    try {
      await api.post("/content/admission-template", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Admission template uploaded.");
      setAdmissionTemplateFile(null);
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Template upload failed.");
    }
  };

  const uploadHeroImage = async () => {
    if (!heroImageFile) return toast.error("Please choose a hero image.");

    const fd = new FormData();
    fd.append("image", heroImageFile);

    try {
      await api.post("/content/hero-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Hero image updated.");
      setHeroImageFile(null);
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Hero image upload failed.");
    }
  };

  const deleteHeroImage = async () => {
    if (!window.confirm("Delete hero image and restore default image?")) return;

    try {
      await api.delete("/content/hero-image");
      toast.success("Hero image deleted. Default image restored.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete hero image.");
    }
  };

  if (loading) return <Loader text="Loading admin dashboard..." />;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-body">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <h1 className="font-display text-3xl text-primary-700">Admin Dashboard</h1>
          <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-lg">Logout</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg capitalize ${activeTab === tab ? "bg-primary-700 text-white" : "bg-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <section className="grid md:grid-cols-4 gap-4">
            <StatCard label="Gallery Photos" value={stats.galleryCount} />
            <StatCard label="Notices" value={stats.noticeCount} />
            <StatCard label="Events" value={stats.eventCount} />
            <StatCard label="Contact Messages" value={stats.messageCount} />
          </section>
        )}

        {activeTab === "messages" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <article className="bg-white p-4 rounded-xl shadow-soft">
                  <p className="text-slate-600">No contact messages yet.</p>
                </article>
              ) : (
                messages.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedMessage(item)}
                    className="w-full text-left bg-white p-4 rounded-xl shadow-soft hover:shadow-lg transition"
                  >
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.email}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-700 mt-2 truncate">{item.message}</p>
                  </button>
                ))
              )}
            </div>

            <article className="bg-white p-5 rounded-xl shadow-soft min-h-52">
              {selectedMessage ? (
                <>
                  <h3 className="font-display text-xl text-primary-700">Message Details</h3>
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">From:</span> {selectedMessage.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Email:</span> {selectedMessage.email}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Received:</span>{" "}
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-4 border rounded-lg p-3 bg-slate-50">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </>
              ) : (
                <p className="text-slate-600">Select a message from the left list to open it.</p>
              )}
            </article>
          </section>
        )}

        {activeTab === "gallery" && (
          <section className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-soft">
              <h2 className="font-display text-xl">Upload Photos</h2>
              <input className="mt-3 border rounded-lg px-3 py-2 w-full md:w-auto" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Title" />
              <input className="mt-3 block" type="file" multiple accept="image/*" onChange={handleFileChange} />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                {preview.map((src) => <img key={src} src={src} alt="preview" className="h-24 w-full object-cover rounded" />)}
              </div>
              <button onClick={handleUpload} className="mt-4 bg-primary-700 text-white px-4 py-2 rounded-lg">Upload</button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <article key={item._id} className="bg-white rounded-xl overflow-hidden shadow-soft">
                  <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
                  <div className="p-3 flex justify-between items-center">
                    <p className="text-sm">{item.title}</p>
                    <button onClick={() => deleteGalleryItem(item._id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "notices" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Add Notice</h2>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Description" value={noticeForm.description} onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={noticeForm.isPinned} onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })} />
                Pin notice
              </label>
              <button onClick={createNotice} className="bg-primary-700 text-white px-4 py-2 rounded-lg">Save Notice</button>
            </div>
            <div className="space-y-3">
              {notices.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <button onClick={() => deleteNotice(item._id)} className="text-red-600 text-sm">Delete</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "events" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Add Event</h2>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              <input type="date" className="w-full border rounded-lg px-3 py-2" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
              <button onClick={createEvent} className="bg-primary-700 text-white px-4 py-2 rounded-lg">Save Event</button>
            </div>
            <div className="space-y-3">
              {events.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-500">{new Date(item.eventDate).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <button onClick={() => deleteEvent(item._id)} className="text-red-600 text-sm">Delete</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "content" && (
          <section className="bg-white p-4 rounded-xl shadow-soft space-y-2">
            <h2 className="font-display text-xl">Update School Content</h2>
            {[
              ["tagline", "Tagline"],
              ["aboutHistory", "About History"],
              ["mission", "Mission"],
              ["vision", "Vision"],
              ["principalMessage", "Principal Message"],
              ["contactEmail", "Contact Email"],
              ["contactPhone", "Contact Phone"],
              ["address", "Address"],
              ["googleMapEmbedUrl", "Google Map Embed URL"],
              ["admissionTemplateUrl", "Admission Template URL"],
              ["admissionTemplateName", "Admission Template Name"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm text-slate-600">{label}</label>
                {["aboutHistory", "mission", "vision", "principalMessage"].includes(key) ? (
                  <textarea className="w-full border rounded-lg px-3 py-2" rows="3" value={content[key] || ""} onChange={(e) => setContent({ ...content, [key]: e.target.value })} />
                ) : (
                  <input className="w-full border rounded-lg px-3 py-2" value={content[key] || ""} onChange={(e) => setContent({ ...content, [key]: e.target.value })} />
                )}
              </div>
            ))}
            <div className="border rounded-lg p-3 bg-slate-50">
              <p className="text-sm text-slate-700 font-semibold">Homepage Hero Image</p>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={uploadHeroImage}
                  className="bg-primary-700 text-white px-4 py-2 rounded-lg"
                >
                  Upload Hero Image
                </button>
                <button
                  type="button"
                  onClick={deleteHeroImage}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete Hero Image
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                If no hero image is uploaded, the default homepage image is shown automatically.
              </p>
              {content.heroImageUrl ? (
                <a
                  href={content.heroImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-primary-700 underline text-sm"
                >
                  View current hero image
                </a>
              ) : null}
            </div>

            <div className="border rounded-lg p-3 bg-slate-50">
              <p className="text-sm text-slate-700 font-semibold">Upload PDF/DOC Admission Template</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="mt-2 block"
                onChange={(e) => setAdmissionTemplateFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={uploadAdmissionTemplate}
                className="mt-3 bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                Upload Template
              </button>
              {content.admissionTemplateUrl ? (
                <a
                  href={content.admissionTemplateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 text-primary-700 underline text-sm"
                >
                  View current template
                </a>
              ) : null}
            </div>
            <button onClick={saveContent} className="bg-primary-700 text-white px-4 py-2 rounded-lg">Save Changes</button>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="bg-white p-5 rounded-xl shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-display text-primary-700 mt-2">{value}</p>
    </article>
  );
}


