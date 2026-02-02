import EditProfileClient from "./EditProfileClient";

export default function EditProfilePage({ params }) {
  const name = params.name;  // ✅ params is safe in server component

  return <EditProfileClient name={name} />;
}
