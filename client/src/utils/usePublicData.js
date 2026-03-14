import { useEffect, useState } from "react";
import api from "../api/api";

const defaultContent = {
  schoolName: "JMS Public School Chaudiha",
  tagline: "Nurturing Minds, Building Futures",
  aboutHistory: "",
  aboutImageUrl: "",
  mission: "",
  vision: "",
  principalName: "Dr. A. Sharma",
  principalMessage: "",
  principalPhotoUrl: "",
  facultyIntro: "",
  admissionsInfo: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  contactImageUrl: "",
  googleMapEmbedUrl: "",
  heroImageUrl: "",
  heroImagePublicId: "",
  admissionTemplateUrl: "",
  admissionTemplateName: "",
  feeStructure: [],
  academicPrograms: [],
  downloads: [],
  facilities: [],
  highlights: [],
  testimonials: [],
};

export default function usePublicData() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(defaultContent);
  const [gallery, setGallery] = useState([]);
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await api.get("/public/overview");
        setContent(data.content || defaultContent);
        setGallery(data.gallery || []);
        setEvents(data.events || []);
        setNotices(data.notices || []);
        setFaculty(data.faculty || []);
        setMaterials(data.materials || []);
        setNotifications(data.notifications || []);
      } catch (_error) {
        setContent(defaultContent);
        setGallery([]);
        setEvents([]);
        setNotices([]);
        setFaculty([]);
        setMaterials([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return {
    loading,
    content,
    gallery,
    events,
    notices,
    faculty,
    materials,
    notifications,
  };
}
