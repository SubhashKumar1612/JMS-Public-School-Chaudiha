import { Helmet } from "react-helmet-async";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

export default function AdmissionsPage() {
  const { content, loading } = usePublicData();
  const templateUrl = content.admissionTemplateUrl || "/admission-form-template.txt";
  const templateName = content.admissionTemplateName || "JMS-Admission-Form-Template.txt";

  if (loading) return <Loader text="Loading admissions..." />;

  return (
    <>
      <Helmet><title>Admissions | JMS Public School Chaudiha</title></Helmet>
      <h1 className="font-display text-3xl text-primary-700">Admissions</h1>
      <div className="bg-white mt-6 p-6 rounded-xl shadow-soft space-y-4 text-slate-700">
        <p><strong>Step 1:</strong> Collect admission form from school office or download from portal.</p>
        <p><strong>Step 2:</strong> Submit form with required documents.</p>
        <p><strong>Step 3:</strong> Interaction/assessment and final enrollment.</p>
        <a
          href={templateUrl}
          download={templateName}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-primary-700 text-white px-5 py-2 rounded-lg hover:bg-primary-900 transition"
        >
          Download Admission Form
        </a>
      </div>
    </>
  );
}
