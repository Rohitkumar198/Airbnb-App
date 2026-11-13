
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  address: "",
  price: "",
  location: "",
  image: "",
  guests: 1,
  bedrooms: 1,
  bathrooms: 1,
};

export default function ManageProperties() {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // LOAD PROPERTIES
  const load = async () => {
    try {
      const { data } = await api.get("/admin/properties");
      setProperties(data.properties || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load properties"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // CREATE / UPDATE PROPERTY
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        title: form.title,
        description: form.description,

        // Backend field names
        category: form.category,
        pricePerNight: Number(form.price),

        location: {
          city: form.location,
          address: form.address,
          country: "India",
        },

        images: form.image ? [form.image] : [],

        maxGuests: Number(form.guests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      };

      if (editingId) {
        await api.put(
          `/admin/properties/${editingId}`,
          payload
        );
        setMessage("Property updated successfully!");
      } else {
        await api.post("/admin/properties", payload);
        setMessage("Property created successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);

      await load();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not save property"
      );
    } finally {
      setSaving(false);
    }
  };

  // EDIT PROPERTY
  const edit = (property) => {
    setEditingId(property._id);

    setForm({
      title: property.title || "",
      description: property.description || "",
      category: property.category || "",
      address: property.location?.address || "",

      price: property.pricePerNight ?? "",

      location:
        property.location?.city || "",

      image: property.images?.[0] || "",

      guests: property.maxGuests ?? 1,
      bedrooms: property.bedrooms ?? 1,
      bathrooms: property.bathrooms ?? 1,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE PROPERTY
  const remove = async (id) => {
    if (!window.confirm("Delete this property?")) return;

    try {
      await api.delete(`/admin/properties/${id}`);
      setMessage("Property deleted successfully!");

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await load();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not delete property"
      );
    }
  };

  // CANCEL EDIT
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  return (
    <main className="container admin-products-page">
      <h1>Manage properties</h1>

      <form
        className="form-card admin-form product-admin-form"
        onSubmit={submit}
      >
        <div className="admin-form-heading">
          <div>
            <p className="eyebrow">LISTINGS</p>

            <h2>
              {editingId ? "Edit property" : "Add a property"}
            </h2>

            <p>Fill in the stay details for your platform.</p>
          </div>

          <span className="form-heading-icon">＋</span>
        </div>

        <div className="product-fields">
          {[
            ["title", "Title", "text", "e.g. Cozy loft in Mumbai"],
            ["location", "City", "text", "e.g. Mumbai"],
            ["category", "Category", "text", "e.g. Beach, Cabins, City"],
            ["price", "Price per night (₹)", "number", "0"],
            ["guests", "Max guests", "number", "1"],
            ["bedrooms", "Bedrooms", "number", "1"],
            ["bathrooms", "Bathrooms", "number", "1"],
            ["image", "Image URL", "url", "https://example.com/image.jpg"],
            ["description", "Description", "textarea", "Describe the stay"],
          ].map(([field, label, type, placeholder]) => (
            <label
              className={`product-field ${["image", "description"].includes(field)
                  ? "product-field-wide"
                  : ""
                }`}
              key={field}
            >
              <span>
                {label}
                {["title", "price", "location", "description"].includes(field) && (
                  <b> *</b>
                )}
              </span>

              {type === "textarea" ? (
                <textarea
                  name={field}
                  rows="4"
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={handleChange}
                />
              ) : (
                <input
                  name={field}
                  required={["title", "price", "location", "description"].includes(field)}
                  type={type}
                  min={type === "number" ? "1" : undefined}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={handleChange}
                />
              )}
            </label>
          ))}
        </div>

        {message && (
          <p className="form-feedback" role="status">
            {message}
          </p>
        )}

        <div className="product-form-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Add property"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* EXISTING PROPERTIES */}

      <div className="collection-heading existing-products-heading">
        <div>
          <p className="eyebrow">ON YOUR PLATFORM</p>
          <h2>Existing properties</h2>
        </div>

        <span>
          {loading
            ? "Loading..."
            : `${properties.length} properties`}
        </span>
      </div>

      <div className="admin-list">
        {!loading &&
          properties.map((property) => (
            <div className="admin-manage-row" key={property._id}>
              <div className="manage-row-copy">
                <strong>{property.title}</strong>

                <small>
                  ₹{(property.pricePerNight || 0).toLocaleString("en-IN")}
                  /night ·{" "}
                  {property.location?.city || "—"} ·{" "}
                  {property.maxGuests || "?"} guests
                </small>
              </div>

              <div className="manage-row-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => edit(property)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={() => remove(property._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

        {!loading && properties.length === 0 && (
          <p>No properties found.</p>
        )}
      </div>
    </main>
  );
}
