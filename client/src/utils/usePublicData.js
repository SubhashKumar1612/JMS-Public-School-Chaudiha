import { useEffect, useState } from "react";
import api from "../api/api";

const defaultContent = {
  schoolName: "JMS Public School Chaudiha",
  tagline: "Nurturing Minds, Building Futures",
  aboutHistory: "",
  mission: "",
  vision: "",
  principalMessage: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  googleMapEmbedUrl: "",
  heroImageUrl: "",
  heroImagePublicId: "",
  admissionTemplateUrl: "",
  admissionTemplateName: "",
};

export default function usePublicData() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(defaultContent);
  const [gallery, setGallery] = useState([]);
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [contentRes, galleryRes, eventRes, noticeRes] = await Promise.all([
          api.get("/content"),
          api.get("/gallery"),
          api.get("/events"),
          api.get("/notices"),
        ]);

        setContent(contentRes.data || defaultContent);
        setGallery(galleryRes.data || []);
        setEvents(eventRes.data || []);
        setNotices(noticeRes.data || []);
      } catch (_error) {
        setContent(defaultContent);
        setGallery([]);
        setEvents([]);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { loading, content, gallery, events, notices };
}
