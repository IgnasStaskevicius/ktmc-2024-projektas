import { useState, useEffect } from "react";
import '../css/bootstrap.css'

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users from the backend when the component is mounted
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:3001/users"); // Ensure the URL starts with http:// or https://
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleRoleChange = (id, newRole) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) => (user.id === id ? { ...user, role: newRole } : user))
        );
    };

    const handleSave = async (id) => {
        const user = users.find((u) => u.id === id);
        try {
            const response = await fetch(`http://localhost:3001/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: user.role }), // Only sending the role change
            });
            if (!response.ok) throw new Error("Failed to save changes");
            setEditingUserId(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await fetch(`http://localhost:3001/users/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete user");
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <p>Loading users...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="container">
            <section>
                <div className="my-4">
                    <h3 className="text-center">Vartotojai</h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Save</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(user.id, e.target.value)
                                                }
                                                disabled={editingUserId !== user.id}
                                                className="form-select"
                                            >
                                                <option value="Administratorius">Administratorius</option>
                                                <option value="Vartotojas">Vartotojas</option>
                                                <option value="Narys">Narys</option>
                                            </select>
                                        </td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-success"
                                                    onClick={() => handleSave(user.id)}
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-warning"
                                                    onClick={() => setEditingUserId(user.id)}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AdminUsers;
