import { useState, FormEvent } from 'react';
import styles from '../../styles/YatchForm/YatchForm.module.css';
import Select, { GroupBase, MultiValue } from 'react-select';
import { NumericFormat } from 'react-number-format';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { uploadToCloudinary } from '../../utils/cloudinary';
import { useNavigate, useLocation } from 'react-router-dom';

// New interfaces for add-on services (if not imported from types)
interface AddonService {
  service: string;
  pricePerHour: number;
}

// Updated YachtFormData interface to include new pricing, addon, and package details
interface YachtFormData {
  name: string;
  pickupat: string;
  location: string;
  description: string;
  // Updated pricing structure:
  price: {
    sailing: {
      peakTime: number;
      nonPeakTime: number;
    };
    anchoring: {
      peakTime: number;
      nonPeakTime: number;
    };
  };
  availability: boolean;
  amenities: string[];
  capacity: number;
  mnfyear?: number;
  dimension?: string;
  crews?: { name: string; role: string }[];
  images: string[];
  YachtType: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  uniqueFeatures: string;
  availabilityFrom: string;
  availabilityTo: string;
  crewCount: string;
  // New fields:
  addonServices: AddonService[];
  packageTypes: string[];
}

// Updated location options (only one option per group for simplicity)
interface LocationOption {
  label: string;
  value: string;
}

// New pickup location options
const LOCATIONS: Record<'Old Goa' | 'Panjim' | 'Britona', LocationOption[]> = {
  "Old Goa": [
    { label: "Old Goa", value: "old_goa" }
  ],
  Panjim: [
    { label: "Panjim", value: "panjim" }
  ],
  Britona: [
    { label: "Britona", value: "britona" }
  ]
};

const locationOptions: GroupBase<LocationOption>[] = [
  { label: "Old Goa", options: LOCATIONS["Old Goa"] },
  { label: "Panjim", options: LOCATIONS.Panjim },
  { label: "Britona", options: LOCATIONS.Britona }
];

// New add-on options
const addonOptions = [
  { label: 'Photographer', value: 'Photographer' },
  { label: 'Photographer + Drone shot', value: 'Photographer + Drone shot' },
  { label: 'Birthday Cake', value: 'Birthday Cake' },
  { label: 'Anniversary Cake', value: 'Anniversary Cake' },
  { label: 'Dancers', value: 'Dancers' },
  { label: 'Decoration', value: 'Decoration' },
];

// New packages options
const packageOptions = [
  { label: '1 hour sailing + 1 hour anchorage', value: '1_hour_sailing_1_hour_anchorage' },
  { label: '1.5 hours sailing + 0.5 hour anchorage', value: '1.5_hours_sailing_0.5_hour_anchorage' },
  { label: '2 hours sailing + 0 hour anchorage', value: '2_hours_sailing_0_hour_anchorage' },

  { label: '2 hours sailing + 1 hour anchorage', value: '2_hours_sailing_1_hour_anchorage' },
  { label: '1.5 hours sailing + 1.5 hours anchorage', value: '1.5_hours_sailing_1.5_hours_anchorage' },
  { label: '2.5 hours sailing + 0.5 hour anchorage', value: '2.5_hours_sailing_0.5_hour_anchorage' },

  { label: '2 hours sailing + 2 hours anchorage', value: '2_hours_sailing_2_hours_anchorage' },
  { label: '3 hours sailing + 1 hour anchorage', value: '3_hours_sailing_1_hour_anchorage' },
  { label: '3.5 hours sailing + 0.5 hour anchorage', value: '3.5_hours_sailing_0.5_hour_anchorage' }
];

// Updated category options
const categoryOptions = [
  { label: 'Economy (under 20k)', value: 'economy' },
  { label: 'Premium (under 30k)', value: 'premium' },
  { label: 'Luxury (Under 40k)', value: 'luxury' },
  { label: 'Ultra luxury (above 40k)', value: 'ultraLuxury' },
];

const YachtForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.state?.isEdit;
  const yachtId = location.state?.yachtId;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<MultiValue<{ label: string; value: string }>>([]);
  const [selectedPackages, setSelectedPackages] = useState<MultiValue<{ label: string; value: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<YachtFormData>({
    name: '',
    location: '',
    pickupat: '',
    description: '',
    price: {
      sailing: { peakTime: 0, nonPeakTime: 0 },
      anchoring: { peakTime: 0, nonPeakTime: 0 }
    },
    availability: true,
    amenities: [],
    capacity: 0,
    mnfyear: undefined,
    dimension: '',
    crews: [],
    images: [],
    YachtType: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    uniqueFeatures: '',
    availabilityFrom: '',
    availabilityTo: '',
    crewCount: '',
    addonServices: [],
    packageTypes: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof YachtFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof YachtFormData, string>> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.name.trim()) {
      newErrors.name = 'Yacht name is required';
    }
    if (!formData.capacity || isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Please enter a valid capacity';
    }
    if (!formData.mnfyear) {
      newErrors.mnfyear = 'Manufacturer year is required';
    } else {
      const year = Number(formData.mnfyear);
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.mnfyear = `Please enter a valid year between 1900 and ${currentYear}`;
      }
    }
    if (!formData.location) {
      newErrors.location = 'Pickup location is required';
    }
    if (!formData.YachtType) {
      newErrors.YachtType = 'Category is required';
    }
    if (!formData.crewCount || isNaN(Number(formData.crewCount)) || Number(formData.crewCount) < 0) {
      newErrors.crewCount = 'Please enter a valid crew count';
    }
    if (!formData.price.sailing.peakTime) {
      newErrors.price = 'Peak Hours Sailing Price is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationChange = (selected: any) => {
    setSelectedLocation(selected);
    setFormData(prev => ({
      ...prev,
      pickupat: selected.value,
      location: selected.label
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });
      if (validFiles.length !== files.length) {
        setUploadError('Some files were skipped. Please only upload images under 5MB.');
      }
      const uploadPromises = validFiles.map(file => uploadToCloudinary(file));
      const cloudinaryUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...cloudinaryUrls]
      }));
    } catch (error) {
      console.error('Error handling file upload:', error);
      setUploadError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleDimensionChange = (value: string, dimension: keyof YachtFormData["dimensions"]) => {
    setFormData(prev => {
      const newDimensions = { ...prev.dimensions, [dimension]: value };
      return {
        ...prev,
        dimensions: newDimensions,
        dimension: `${newDimensions.length}x${newDimensions.width}x${newDimensions.height}`
      };
    });
  };

  const handleStartTimeChange = (time: Date | null) => {
    setStartTime(time);
    setFormData(prev => ({
      ...prev,
      availabilityFrom: time ? time.toISOString() : ''
    }));
  };
  
  const handleEndTimeChange = (time: Date | null) => {
    setEndTime(time);
    setFormData(prev => ({
      ...prev,
      availabilityTo: time ? time.toISOString() : ''
    }));
  };

  // Handle multi-select changes for Addon Services
  const handleAddonChange = (selected: MultiValue<{ label: string; value: string }>) => {
    setSelectedAddons(selected);
    // Update addonServices in formData with default price 0 for new selections
    setFormData(prev => ({
      ...prev,
      addonServices: selected.map(item => ({
        service: item.value,
        pricePerHour: prev.addonServices.find(a => a.service === item.value)?.pricePerHour || 0
      }))
    }));
  };

  // Handle update for add-on price
  const handleAddonPriceChange = (service: string, price: number) => {
    setFormData(prev => ({
      ...prev,
      addonServices: prev.addonServices.map(a =>
        a.service === service ? { ...a, pricePerHour: price } : a
      )
    }));
  };

  // Handle multi-select changes for Packages
  const handlePackagesChange = (selected: MultiValue<{ label: string; value: string }>) => {
    setSelectedPackages(selected);
    setFormData(prev => ({
      ...prev,
      packageTypes: selected.map(item => item.value)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const yachtData = {
        ...formData,
        // Combine uniqueFeatures as amenities if amenities not explicitly provided
        amenities: formData.amenities.length 
          ? formData.amenities 
          : formData.uniqueFeatures.split(',').map(f => f.trim()),
        crews: Array(Number(formData.crewCount))
          .fill(null)
          .map(() => ({ name: '', role: '' })),
        dimension: `${formData.dimensions.length}x${formData.dimensions.width}x${formData.dimensions.height}`,
        availability: startTime && endTime ? true : false
      };
  
      // Navigate to review page with yacht data
      navigate('/yatch-review', { 
        state: { 
          yachtData,
          isEdit: isEditMode,
          yachtId: yachtId
        }
      });
  
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to create yacht. Please try again.'
      );
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Row 1: Yacht Name & Photo Upload */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name of the Yacht*</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? styles.error : styles.input_container}
          />
          {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="photos">Add Photos or Videos*</label>
          <div className={styles.fileUpload}>
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading && <div className={styles.uploadingStatus}>Uploading...</div>}
            {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}
          </div>
          <div className={styles.imagePreview}>
            {formData.images.map((url, index) => (
              <div key={url} className={styles.previewItem}>
                <img src={url} alt={`Upload ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Capacity & Manufacturer Year */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="capacity">Capacity*</label>
          <input
            type="number"
            id="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            min="1"
            className={errors.capacity ? styles.error : styles.input_container}
          />
          {errors.capacity && <span className={styles.errorMessage}>{errors.capacity}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mnfyear">Manufacturer Year*</label>
          <input
            type="number"
            id="mnfyear"
            value={formData.mnfyear}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()}
            className={errors.mnfyear ? styles.error : styles.input_container}
          />
          {errors.mnfyear && <span className={styles.errorMessage}>{errors.mnfyear}</span>}
        </div>
      </div>

      {/* Row 3: Category & No. of Crew */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="YachtType">Category*</label>
          <Select
            options={categoryOptions}
            value={categoryOptions.find(opt => opt.value === formData.YachtType) || null}
            onChange={(selected) =>
              setFormData(prev => ({ ...prev, YachtType: selected?.value || '' }))
            }
            className={errors.YachtType ? styles.error : styles.selectContainer}
          />
          {errors.YachtType && <span className={styles.errorMessage}>{errors.YachtType}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="crewCount">No. of Crew*</label>
          <input
            type="number"
            id="crewCount"
            value={formData.crewCount}
            onChange={handleInputChange}
            min="0"
            className={errors.crewCount ? styles.error : styles.input_container}
          />
          {errors.crewCount && <span className={styles.errorMessage}>{errors.crewCount}</span>}
        </div>
      </div>

      {/* Row 4: Dimensions & Pickup Location */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="dimensions">Dimensions*</label>
          <div className={styles.input_Box}>
            <input
              type="number"
              placeholder="Length"
              value={formData.dimensions.length}
              onChange={(e) => handleDimensionChange(e.target.value, 'length')}
              className={errors.dimensions ? styles.error : styles.input_container}
            />
            <input
              type="number"
              placeholder="Width"
              value={formData.dimensions.width}
              onChange={(e) => handleDimensionChange(e.target.value, 'width')}
              className={errors.dimensions ? styles.error : styles.input_container}
            />
            <input
              type="number"
              placeholder="Height"
              value={formData.dimensions.height}
              onChange={(e) => handleDimensionChange(e.target.value, 'height')}
              className={errors.dimensions ? styles.error : styles.input_container}
            />
          </div>
          {errors.dimensions && <span className={styles.errorMessage}>{errors.dimensions}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Pickup Location*</label>
          <Select
            options={locationOptions}
            value={selectedLocation}
            onChange={handleLocationChange}
            className={styles.selectContainer}
          />
          {errors.location && <span className={styles.errorMessage}>{errors.location}</span>}
        </div>
      </div>

      {/* Row 5: Availability From & To */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="availabilityFrom">Availability (From)*</label>
          <DatePicker
            selected={startTime}
            onChange={handleStartTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className={styles.date_picker}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="availabilityTo">Availability (To)*</label>
          <DatePicker
            selected={endTime}
            onChange={handleEndTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className={styles.date_picker}
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className={styles.priceGroup}>
        <h3 className={styles.subHeading}>Pricing Details</h3>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Peak Hours Sailing Price*</label>
            <NumericFormat
              thousandSeparator
              prefix="₹"
              value={formData.price.sailing.peakTime}
              onValueChange={(values) => {
                setFormData(prev => ({
                  ...prev,
                  price: {
                    ...prev.price,
                    sailing: {
                      ...prev.price.sailing,
                      peakTime: Number(values.value)
                    }
                  }
                }));
              }}
              className={errors.price ? styles.error : styles.input_container}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Peak Hours Anchorage Price</label>
            <NumericFormat
              thousandSeparator
              prefix="₹"
              value={formData.price.anchoring.peakTime}
              onValueChange={(values) => {
                setFormData(prev => ({
                  ...prev,
                  price: {
                    ...prev.price,
                    anchoring: {
                      ...prev.price.anchoring,
                      peakTime: Number(values.value)
                    }
                  }
                }));
              }}
              className={styles.input_container}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Non Peak Hours Sailing Price</label>
            <NumericFormat
              thousandSeparator
              prefix="₹"
              value={formData.price.sailing.nonPeakTime}
              onValueChange={(values) => {
                setFormData(prev => ({
                  ...prev,
                  price: {
                    ...prev.price,
                    sailing: {
                      ...prev.price.sailing,
                      nonPeakTime: Number(values.value)
                    }
                  }
                }));
              }}
              className={styles.input_container}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Non Peak Hours Anchorage Price</label>
            <NumericFormat
              thousandSeparator
              prefix="₹"
              value={formData.price.anchoring.nonPeakTime}
              onValueChange={(values) => {
                setFormData(prev => ({
                  ...prev,
                  price: {
                    ...prev.price,
                    anchoring: {
                      ...prev.price.anchoring,
                      nonPeakTime: Number(values.value)
                    }
                  }
                }));
              }}
              className={styles.input_container}
            />
          </div>
        </div>
      </div>

      {/* Add-on Services Section */}
      <div className={styles.formGroup}>
        <label>Add-On Services (Select and set price per hour)</label>
        <Select
          options={addonOptions}
          value={selectedAddons}
          onChange={handleAddonChange}
          isMulti
          className={styles.selectContainer}
        />
        {selectedAddons.length > 0 && (
          <div className={styles.addonList}>
            {selectedAddons.map((item) => (
              <div key={item.value} className={styles.addonItem}>
                <span>{item.label}</span>
                <NumericFormat
                  thousandSeparator
                  prefix="₹"
                  placeholder="Set Price"
                  value={
                    formData.addonServices.find(a => a.service === item.value)?.pricePerHour || 0
                  }
                  onValueChange={(values) =>
                    handleAddonPriceChange(item.value, Number(values.value))
                  }
                  className={styles.addonInput}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Packages Section */}
      <div className={styles.formGroup}>
        <label>Select Available Packages</label>
        <Select
          options={packageOptions}
          value={selectedPackages}
          onChange={handlePackagesChange}
          isMulti
          className={styles.selectContainer}
        />
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label htmlFor="description">Write a Brief about your Yacht*</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleInputChange}
          className={errors.description ? styles.error : styles.input_container}
        />
        {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
      </div>

      {/* Unique Features (moved to bottom) */}
      <div className={styles.formGroup}>
        <label htmlFor="uniqueFeatures">Unique Features</label>
        <textarea
          id="uniqueFeatures"
          value={formData.uniqueFeatures}
          onChange={handleInputChange}
          className={styles.input_container}
        />
      </div>

      {/* Submit Section */}
      {submitError && (
        <div className={styles.errorMessage}>
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className={styles.successMessage}>
          Yacht created successfully!
        </div>
      )}

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Confirm & Continue'}
      </button>
    </form>
  );
};

export default YachtForm;





// import { useState, FormEvent, useEffect } from 'react';
// import styles from '../../styles/YatchForm/YatchForm.module.css';
// import Select from 'react-select';
// import { NumericFormat } from 'react-number-format';
// import "react-datepicker/dist/react-datepicker.css";
// import DatePicker from "react-datepicker";
// import { GroupBase } from 'react-select';
// import { uploadToCloudinary } from '../../utils/cloudinary';
// import { useNavigate } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';
// import { ownerAPI } from '../../api/owner';

// interface LocationOption {
//   label: string;
//   value: string;
//   coordinates: [number, number]; // Tuple type
// }



// const LOCATIONS: Record<'Goa' | 'Dubai', LocationOption[]> = {
//   Goa: [
//     { label: "Miramar Beach", value: "miramar", coordinates: [15.4909, 73.8126] },
//     { label: "Calangute", value: "calangute", coordinates: [15.5449, 73.7526] },
//     { label: "Panjim Marina", value: "panjim", coordinates: [15.4989, 73.8278] },
//     { label: "Baga Beach", value: "baga", coordinates: [15.5566, 73.7516] },
//     { label: "Dona Paula", value: "donapaula", coordinates: [15.4511, 73.8047] }
//   ],
//   Dubai: [
//     { label: "Dubai Marina", value: "marina", coordinates: [25.0819, 55.1367] },
//     { label: "Port Rashid", value: "portrashid", coordinates: [25.2866, 55.2744] },
//     { label: "Dubai Creek", value: "creek", coordinates: [25.2048, 55.3271] },
//     { label: "Palm Jumeirah", value: "palm", coordinates: [25.1124, 55.1390] },
//     { label: "Dubai Harbour", value: "harbour", coordinates: [25.0989, 55.1508] }
//   ]
// };

// // Update the Select component options type:
// const locationOptions: GroupBase<LocationOption>[] = [
//   { label: "Goa", options: LOCATIONS.Goa },
//   { label: "Dubai", options: LOCATIONS.Dubai }
// ];
// interface DimensionsData {
//   length: string;
//   width: string;
//   height: string;
// }

// interface Location {
//   type: "Point";
//   coordinates: [number, number];
// }

// interface Crew {
//   name: string;
//   role: string;
// }

// interface YachtFormData {
//   name: string;
//   pickupat: string;
//   location: Location;
//   description: string;
//   price: {
//     sailing: number;
//     still: number;
//   };
//   availability: boolean;
//   amenities: string[];
//   capacity: number;
//   mnfyear?: number;
//   dimension?: string;
//   crews?: Crew[];
//   images: string[];
//   YachtType: string;
//   dimensions: DimensionsData;
//   uniqueFeatures: string;
//   availabilityFrom: string;
//   availabilityTo: string;
//   crewCount: string;
// }

// const YachtForm = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const isEditMode = location.state?.isEdit;
//   const yachtId = location.state?.yachtId;

//   const [isLoading, setIsLoading] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadError, setUploadError] = useState<string | null>(null);
//   const [startTime, setStartTime] = useState<Date | null>(new Date());
//   const [endTime, setEndTime] = useState<Date | null>(new Date());
//   const [selectedLocation, setSelectedLocation] = useState<{ label: string; value: string; coordinates: [number, number] } | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitSuccess, setSubmitSuccess] = useState(false);

//   // Initialize form data state
//   const [formData, setFormData] = useState<YachtFormData>({
//     name: '',
//     pickupat: '',
//     location: {
//       type: "Point",
//       coordinates: [0, 0]
//     },
//     description: '',
//     price: {
//       sailing: 0,
//       still: 0
//     },
//     availability: true,
//     amenities: [],
//     capacity: 0,
//     mnfyear: undefined,
//     dimension: '',
//     crews: [],
//     images: [],
//     YachtType: '',
//     dimensions: {
//       length: '',
//       width: '',
//       height: ''
//     },
//     uniqueFeatures: '',
//     availabilityFrom: '',
//     availabilityTo: '',
//     crewCount: ''
//   });

//   const [errors, setErrors] = useState<Partial<Record<keyof YachtFormData, string>>>({});

//   const validateForm = (): boolean => {
//     const newErrors: Partial<Record<keyof YachtFormData, string>> = {};
//     const currentYear = new Date().getFullYear();

//     if (!formData.name.trim()) {
//       newErrors.name = 'Yacht name is required';
//     }

//     if (!formData.capacity) {
//       newErrors.capacity = 'Capacity is required';
//     } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
//       newErrors.capacity = 'Please enter a valid capacity';
//     }

//     if (!formData.mnfyear) {
//       newErrors.mnfyear = 'Manufacturer year is required';
//     } else {
//       const year = Number(formData.mnfyear);
//       if (isNaN(year) || year < 1900 || year > currentYear) {
//         newErrors.mnfyear = `Please enter a valid year between 1900 and ${currentYear}`;
//       }
//     }

//     if (!formData.pickupat) {
//       newErrors.pickupat = 'Pickup location is required';
//     }

//     if (!formData.YachtType) {
//       newErrors.YachtType = 'Category is required';
//     }

//     if (!formData.crewCount) {
//       newErrors.crewCount = 'Number of crew is required';
//     } else if (isNaN(Number(formData.crewCount)) || Number(formData.crewCount) < 0) {
//       newErrors.crewCount = 'Please enter a valid crew count';
//     }

//     if (!formData.price.sailing) {
//       newErrors.price = 'Sailing price is required';
//     }

//     if (!formData.description.trim()) {
//       newErrors.description = 'Description is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleLocationChange = (selected: any) => {
//     setSelectedLocation(selected);
//     setFormData(prev => ({
//       ...prev,
//       pickupat: selected.label,
//       location: {
//         type: "Point",
//         coordinates: selected.coordinates
//       }
//     }));
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({ ...prev, [id]: value }));
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
    
//     setIsUploading(true);
//     setUploadError(null);
    
//     try {
//       const files = Array.from(e.target.files);
      
//       // Optional: Add file validation
//       const validFiles = files.filter(file => {
//         const isValidType = file.type.startsWith('image/');
//         const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
//         return isValidType && isValidSize;
//       });

//       if (validFiles.length !== files.length) {
//         setUploadError('Some files were skipped. Please only upload images under 5MB.');
//       }

//       const uploadPromises = validFiles.map(file => uploadToCloudinary(file));
//       const cloudinaryUrls = await Promise.all(uploadPromises);
      
//       setFormData(prev => ({
//         ...prev,
//         images: [...prev.images, ...cloudinaryUrls]
//       }));
//     } catch (error) {
//       console.error('Error handling file upload:', error);
//       setUploadError('Failed to upload images. Please try again.');
//     } finally {
//       setIsUploading(false);
//     }
//   };


//   // Optional: Add function to remove uploaded images
//   const handleRemoveImage = (indexToRemove: number) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, index) => index !== indexToRemove)
//     }));
//   };
//   const handleDimensionChange = (value: string, dimension: keyof DimensionsData) => {
//     setFormData(prev => ({
//       ...prev,
//       dimensions: {
//         ...prev.dimensions,
//         [dimension]: value
//       },
//       dimension: `${prev.dimensions.length}x${prev.dimensions.width}x${prev.dimensions.height}`
//     }));
//   };

//   const handleStartTimeChange = (time: Date | null) => {
//     setStartTime(time);
//     setFormData(prev => ({
//       ...prev,
//       availabilityFrom: time ? time.toISOString() : ''
//     }));
//   };
  
//   const handleEndTimeChange = (time: Date | null) => {
//     setEndTime(time);
//     setFormData(prev => ({
//       ...prev,
//       availabilityTo: time ? time.toISOString() : ''
//     }));
//   };


//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
  
//     try {
//       const yachtData = {
//         ...formData,
//         amenities: formData.amenities.length 
//           ? formData.amenities 
//           : formData.uniqueFeatures.split(',').map(f => f.trim()),
//         crews: Array(Number(formData.crewCount))
//           .fill(null)
//           .map(() => ({ name: '', role: '' })),
//         dimension: `${formData.dimensions.length}x${formData.dimensions.width}x${formData.dimensions.height}`,
//         availability: startTime && endTime ? true : false,
//         price: {
//           sailing: Number(formData.price.sailing),
//           still: Number(formData.price.still) || 0
//         }
//       };
  
//       // Navigate to review page with yacht data
//       navigate('/yatch-review', { 
//         state: { 
//           yachtData,
//           isEdit: isEditMode,
//           yachtId: yachtId
//         }
//       });
  
//     } catch (error) {
//       setSubmitError(
//         error instanceof Error 
//           ? error.message 
//           : 'Failed to create yacht. Please try again.'
//       );
//     }
//   };


//   return (
//     <form className={styles.form} onSubmit={handleSubmit}>
//       {/* <div className={styles.yatchBox}>
//         <div className={styles.section_head}>List Your Yacht for Charter</div>
//         <div className={styles.section_head2}>Showcase your yacht to a global audience by adding details, photos, and availability & start earning today!</div>
//       </div> */}
//       <div className={styles.formGrid}>
//         <div className={styles.left}>
//           <div className={styles.formGroup}>
//             <label htmlFor="name">Name of the Yacht*</label>
//             <input
//               type="text"
//               id="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               className={errors.name ? styles.error : 'input_container'}
//             />
//             {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="capacity">Capacity*</label>
//             <input
//               type="number"
//               id="capacity"
//               value={formData.capacity}
//               onChange={handleInputChange}
//               min="1"
//               className={errors.capacity ? styles.error : 'input_container'}
//             />
//             {errors.capacity && <span className={styles.errorMessage}>{errors.capacity}</span>}
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="mnfyear">Manufacturer Year*</label>
//             <input
//               type="number"
//               id="mnfyear"
//               value={formData.mnfyear}
//               onChange={handleInputChange}
//               min="1900"
//               max={new Date().getFullYear()}
//               className={errors.mnfyear ? styles.error : 'input_container'}
//             />
//             {errors.mnfyear && <span className={styles.errorMessage}>{errors.mnfyear}</span>}
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="dimensions">Dimensions*</label>
//             <div className={styles.input_Box}>
//               <div className={styles.date}>
//                 <input
//                   type="number"
//                   placeholder="Length"
//                   value={formData.dimensions.length}
//                   onChange={(e) => handleDimensionChange(e.target.value, 'length')}
//                   className={errors.dimensions ? styles.error : 'input_container'}
//                 />
//               </div>
//               <div className={styles.date}>
//                 <input
//                   type="number"
//                   placeholder="Width"
//                   value={formData.dimensions.width}
//                   onChange={(e) => handleDimensionChange(e.target.value, 'width')}
//                   className={errors.dimensions ? styles.error : 'input_container'}
//                 />
//               </div>
//               <div className={styles.date}>
//                 <input
//                   type="number"
//                   placeholder="Height"
//                   value={formData.dimensions.height}
//                   onChange={(e) => handleDimensionChange(e.target.value, 'height')}
//                   className={errors.dimensions ? styles.error : 'input_container'}
//                 />
//               </div>
//             </div>
//             {errors.dimensions && <span className={styles.errorMessage}>{errors.dimensions}</span>}
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="location">Pickup Location*</label>
//             <Select
//               options={locationOptions}
//               value={selectedLocation}
//               onChange={handleLocationChange}
//               className={styles.locationSelect}
//             />
//             {errors.pickupat && <span className={styles.errorMessage}>{errors.pickupat}</span>}
//           </div>
//         </div>

//         <div className={styles.right}>
//           <div className={styles.formGroup}>
//             <label htmlFor="photos">Add Photos or Videos*</label>
//             <div className={styles.fileUpload}>
//               <input
//                 type="file"
//                 id="photos"
//                 multiple
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 disabled={isUploading}
//               />
//               {isUploading && <div className={styles.uploadingStatus}>Uploading...</div>}
//               {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}
//             </div>
            
//             {/* Preview uploaded images */}
//             <div className={styles.imagePreview}>
//               {formData.images.map((url, index) => (
//                 <div key={url} className={styles.previewItem}>
//                   <img src={url} alt={`Upload ${index + 1}`} />
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveImage(index)}
//                     className={styles.removeButton}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="YachtType">Category*</label>
//             <select
//               id="YachtType"
//               value={formData.YachtType}
//               onChange={handleInputChange}
//               className={errors.YachtType ? styles.error : 'input_container'}
//             >
//               <option value="">Select category</option>
//               <option value="luxury">Luxury</option>
//               <option value="sport">Sport</option>
//               <option value="fishing">Fishing</option>
//               <option value="sailing">Sailing</option>
//             </select>
//             {errors.YachtType && <span className={styles.errorMessage}>{errors.YachtType}</span>}
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="crewCount">No. of Crew*</label>
//             <input
//               type="number"
//               id="crewCount"
//               value={formData.crewCount}
//               onChange={handleInputChange}
//               min="0"
//               className={errors.crewCount ? styles.error : 'input_container'}
//             />
//             {errors.crewCount && <span className={styles.errorMessage}>{errors.crewCount}</span>}
//           </div>
//         </div>
//       </div>

//       <div className={styles.formGroup}>
//         <label htmlFor="uniqueFeatures">Unique Features</label>
//         <textarea
//           id="uniqueFeatures"
//           value={formData.uniqueFeatures}
//           onChange={handleInputChange}
//         />
//       </div>

//       <div className={styles.dateRange}>
//         <div className={styles.formGroup}>
//           <label htmlFor="availabilityFrom">Mention Availability*</label>
//           <div className={styles.input_Box}>
//             <div className={styles.date}>
//               <DatePicker
//                 selected={startTime}
//                 onChange={handleStartTimeChange}
//                 showTimeSelect
//                 showTimeSelectOnly
//                 timeIntervals={30}
//                 timeCaption="Time"
//                 dateFormat="h:mm aa"
//                 className={styles.date_picker}
//               />
//             </div>
//             <div className={styles.date}>
//               <DatePicker
//                 selected={endTime}
//                 onChange={handleEndTimeChange}
//                 showTimeSelect
//                 showTimeSelectOnly
//                 timeIntervals={30}
//                 timeCaption="Time"
//                 dateFormat="h:mm aa"
//                 className={styles.date_picker}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className={styles.priceGroup}>
//         <div className={styles.formGroup}>
//           <label htmlFor="sailingPrice">Price per hour*</label>
//           <div className={styles.input_Box}>
//             <div className={styles.date}>
//               <NumericFormat
//                 thousandSeparator
//                 prefix="₹"
//                 id="sailingPrice"
//                 value={formData.price.sailing}
//                 onValueChange={(values) => {
//                   setFormData(prev => ({
//                     ...prev,
//                     price: {
//                       ...prev.price,
//                       sailing: Number(values.value)
//                     }
//                   }));
//                 }}
//                 className={errors.price ? styles.error : 'input_container'}
//               />
//             </div>
//             <div className={styles.date}>
//               <NumericFormat
//                 thousandSeparator
//                 prefix="₹"
//                 id="stillPrice"
//                 value={formData.price.still}
//                 onValueChange={(values) => {
//                   setFormData(prev => ({
//                     ...prev,
//                     price: {
//                       ...prev.price,
//                       still: Number(values.value)
//                     }
//                   }));
//                 }}
//                 className={errors.price ? styles.error : 'input_container'}
//               />
//             </div>
//           </div>
//           {errors.price && <span className={styles.errorMessage}>{errors.price}</span>}
//         </div>
//       </div>

//       <div className={styles.formGroup + ' ' + styles.fullWidth}>
//         <label htmlFor="description">Write a Brief about your Yacht*</label>
//         <textarea
//           id="description"
//           value={formData.description}
//           onChange={handleInputChange}
//           className={errors.description ? styles.error : 'input_container'}
//         />
//         {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
//       </div>

//       {submitError && (
//         <div className={styles.errorMessage}>
//           {submitError}
//         </div>
//       )}

//       {submitSuccess && (
//         <div className={styles.successMessage}>
//           Yacht created successfully!
//         </div>
//       )}

//       <button 
//         type="submit" 
//         className={styles.submitButton}
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? 'Creating...' : 'Confirm & Continue'}
//       </button>
//     </form>
//   );
// };

// export default YachtForm;