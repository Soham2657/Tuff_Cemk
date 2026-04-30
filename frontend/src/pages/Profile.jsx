import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { profileService } from '../services/profileService';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    profilePicture: '',
    collegeRollNo: '',
    department: '',
    universityRollNo: '',
    year: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');

      // First, initialize from context to show immediate feedback
      if (user) {
        setProfile({
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          profilePicture: user.profilePicture || '',
          collegeRollNo: user.collegeRollNo || '',
          department: user.department || '',
          universityRollNo: user.universityRollNo || '',
          year: user.year || '',
        });
      }

      try {
        const data = await profileService.getMyProfile();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          role: data.role || '',
          profilePicture: data.profilePicture || '',
          collegeRollNo: data.collegeRollNo || '',
          department: data.department || '',
          universityRollNo: data.universityRollNo || '',
          year: data.year || '',
        });
        updateUser(data);
      } catch (apiError) {
        console.error('Profile load error:', apiError);
        setError(apiError.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSaveDetails = async (event) => {
    event.preventDefault();
    setSavingDetails(true);
    setError('');
    setMessage('');

    const payload = {
      name: profile.name,
      email: profile.email,
      collegeRollNo: profile.collegeRollNo,
      department: profile.department,
      universityRollNo: profile.universityRollNo,
      year: profile.year,
    };

    console.log('Saving profile with payload:', payload);

    try {
      const updated = await profileService.upsertMyProfile(payload);
      console.log('Profile save response:', updated);
      
      // Update local profile state with returned values (including name/email)
      setProfile((current) => ({
        ...current,
        name: updated.name || '',
        email: updated.email || '',
        role: updated.role || current.role || '',
        profilePicture: updated.profilePicture || current.profilePicture || '',
        collegeRollNo: updated.collegeRollNo || '',
        department: updated.department || '',
        universityRollNo: updated.universityRollNo || '',
        year: updated.year || '',
      }));
      updateUser(updated);
      setMessage('Profile details saved successfully.');
    } catch (apiError) {
      console.error('Profile save error:', apiError);
      const errorMsg = apiError.response?.data?.message || apiError.message || 'Unable to save profile details.';
      setError(errorMsg);
    } finally {
      setSavingDetails(false);
    }
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPicture(true);
    setError('');
    setMessage('');

    console.log('Uploading profile picture:', file.name);

    try {
      const updated = await profileService.uploadProfilePicture(file);
      console.log('Picture upload response:', updated);
      setProfile((current) => ({ ...current, profilePicture: updated.profilePicture || '' }));
      updateUser(updated);
      setMessage('Profile picture updated successfully.');
    } catch (apiError) {
      console.error('Picture upload error:', apiError);
      const errorMsg = apiError.response?.data?.message || apiError.message || 'Unable to upload profile picture.';
      setError(errorMsg);
    } finally {
      setUploadingPicture(false);
      event.target.value = '';
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 sm:p-6">Loading profile...</div>;
  }

  return (
    <div className="flex-1 w-full pb-20 sm:pb-24">
      <header className="mb-6 sm:mb-8">
        <h2 className="font-h1 text-[30px] sm:text-[40px] font-bold text-on-surface tracking-tight mb-1">My Profile</h2>
        <p className="font-body-lg text-[15px] sm:text-[18px] text-on-surface-variant">Manage your basic student details and profile picture.</p>
      </header>

      {message && (
        <div className="mb-4 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-on-surface">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-on-surface">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 sm:p-6">
          <h3 className="font-h3 text-[20px] sm:text-[24px] font-bold text-on-surface mb-5">Profile Picture</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container flex items-center justify-center">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.name || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-on-surface-variant">{(profile.name || user?.name || 'U').charAt(0)}</span>
              )}
            </div>
            <label className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity text-center w-full sm:w-auto">
              {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePictureChange} disabled={uploadingPicture} />
            </label>
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 sm:p-6">
          <h3 className="font-h3 text-[20px] sm:text-[24px] font-bold text-on-surface mb-5">Basic Details</h3>
          <form onSubmit={handleSaveDetails} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Name</label>
              <input name="name" value={profile.name} onChange={handleInputChange} className="w-full rounded-xl border border-outline-variant/30 px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Email</label>
              <input name="email" value={profile.email} onChange={handleInputChange} className="w-full rounded-xl border border-outline-variant/30 px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Role</label>
              <input value={profile.role} disabled className="w-full rounded-xl border border-outline-variant/30 px-4 py-3 bg-surface-container" />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">College Roll No</label>
              <input
                name="collegeRollNo"
                value={profile.collegeRollNo}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
                placeholder="e.g. CSE-2023-019"
              />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Department</label>
              <input
                name="department"
                value={profile.department}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">University Roll No</label>
              <input
                name="universityRollNo"
                value={profile.universityRollNo}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
                placeholder="e.g. U-23-004219"
              />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Year</label>
              <input
                name="year"
                value={profile.year}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
                placeholder="e.g. 3rd Year"
              />
            </div>
            <div className="md:col-span-2 flex justify-stretch sm:justify-end mt-2">
              <button
                type="submit"
                disabled={savingDetails}
                className="w-full sm:w-auto rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-70"
              >
                {savingDetails ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
