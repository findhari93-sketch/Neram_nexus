export default async function SuperAdminPage() {
  return (
    <div>
      <h1>Super Admin Dashboard</h1>
      <p>This area is restricted to Super Admins only.</p>
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#1e293b",
          borderRadius: "8px",
        }}
      >
        <h2>Super Admin Only Features</h2>
        <ul>
          <li>Manage all users and roles</li>
          <li>System configuration</li>
          <li>View all organization data</li>
        </ul>
      </div>
    </div>
  );
}
