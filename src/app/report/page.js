'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    issue_type: 'pothole',
    location: ''
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImages = [...images];
    const newPreviews = [...previewUrls];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      newImages.push(file);
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
    });

    setImages(newImages);
    setPreviewUrls(newPreviews);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewUrls];

    URL.revokeObjectURL(newPreviews[index]);

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);

    try {
      const base64Images = [];
      for (const image of images) {
        const base64 = await convertToBase64(image);
        base64Images.push({
          data: base64,
          name: image.name,
          type: image.type,
          size: image.size
        });
      }

      const reportData = {
        ...form,
        userId: user._id || user.id,
        images: base64Images,
        status: 'pending',
        createdAt: new Date()
      };

      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Report submitted with images!');

        setForm({
          title: '',
          description: '',
          issue_type: 'pothole',
          location: ''
        });

        setImages([]);
        setPreviewUrls([]);

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError('Something went wrong: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '100px auto', padding: '20px' }}>
      <h1 style={{ color: '#2e7d32' }}>Report an Issue</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Report issues in your community. You can upload up to 5 images.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #ef9a9a'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #a5d6a7'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Issue Title *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g., Large pothole on Main Street"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe the issue in detail..."
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Issue Type *
          </label>
          <select
            name="issue_type"
            value={form.issue_type}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          >
            <option value="pothole">Pothole</option>
            <option value="graffiti">Graffiti</option>
            <option value="rubbish">Rubbish</option>
            <option value="illegal-dumping">Illegal Dumping</option>
            <option value="street-light">Broken Street Light</option>
            <option value="other"> Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Location (Eircode or Address) *
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            placeholder="e.g., D01AB23 or 'Main Street, Dublin'"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Upload Images (Optional)
          </label>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Upload up to 5 images. Max 5MB each. Supported: JPG, PNG, GIF
          </p>

          <div style={{
            border: '2px dashed #4caf50',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: '48px', color: '#4caf50', marginBottom: '10px' }}>

            </div>
            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>
              Click to upload images
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              or drag and drop images here
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
          </div>

          {previewUrls.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>
                Selected Images ({images.length}/5)
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '20px'
              }}>
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px'
                    }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        border: '2px solid #ddd'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                    <div style={{
                      fontSize: '10px',
                      color: '#666',
                      marginTop: '5px',
                      textAlign: 'center'
                    }}>
                      {images[index].name.substring(0, 15)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#81c784' : '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {loading ? (
            <>
              <span></span>
              Submitting Report...
            </>
          ) : (
            <>
              <span></span>
              Submit Report
            </>
          )}
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          color: '#666',
          fontSize: '14px'
        }}>

        </p>
      </form>
    </div>
  );
}