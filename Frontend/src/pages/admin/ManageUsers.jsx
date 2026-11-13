import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../services/api";

export default function ManageUsers() {
  const me = useSelector((s) => s.auth.user);
  const myId = me?._id || me?.id;
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const update = async (id, changes, okMessage) => {
    try {
      await api.patch(`/admin/users/${id}`, changes);
      setMessage(okMessage);
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user and their bookings?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setMessage("User deleted");
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete user");
    }
  };

  return (
    <main className="container admin-users-page">
      <h1>Manage users</h1>
      {message && <p>{message}</p>}
      {users.map((user) => {
        const self = user._id === myId;
        return (
          <div className="admin-manage-row user-manage-row" key={user._id}>
            <div className="manage-row-copy">
              <strong>
                {user.name}
                {self && " (you)"}
              </strong>
              <small>
                {user.email}
                {user.isActive === false && " · deactivated"}
              </small>
            </div>
            <div className="manage-row-actions user-manage-actions">
              <select
                value={user.role}
                disabled={self}
                onChange={(e) =>
                  update(user._id, { role: e.target.value }, "Role updated")
                }
              >
                <option value="user">User</option>
                {user.role === "guest" && <option value="guest">Guest</option>}
                <option value="admin">Admin</option>
              </select>
              <button
                type="button"
                className="secondary"
                disabled={self}
                onClick={() =>
                  update(
                    user._id,
                    { isActive: user.isActive === false },
                    user.isActive === false ? "User activated" : "User deactivated"
                  )
                }
              >
                {user.isActive === false ? "Activate" : "Deactivate"}
              </button>
              <button
                className="danger"
                disabled={self}
                onClick={() => deleteUser(user._id)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </main>
  );
}
