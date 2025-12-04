import ExamCenterFormModern from "../ExamCenterFormModern";

interface ExamCenterPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Edit Exam Center",
  description: "Edit exam center information",
};

export default function ExamCenterPage({ params }: ExamCenterPageProps) {
  return <ExamCenterFormModern centerId={params.id} />;
}
