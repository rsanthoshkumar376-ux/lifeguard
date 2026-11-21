import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Compass, 
  Filter, 
  Droplet, 
  Shield, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Info,
  Clock,
  ShieldAlert,
  Building2,
  Navigation
} from 'lucide-react';
import { BloodGroup, ALL_BLOOD_GROUPS, getCompatibleDonorsFor } from '../../services/bloodCompatibilityService';
import { 
  DonorDiscoveryProfile, 
  searchNearbyDonors, 
  ApproximateLocation 
} from '../../services/donorDiscoveryService';
import { EmergencyBloodRequest, getAllEmergencyRequests } from '../../services/bloodRequestLifecycleService';
import { ReportSpamModal } from './ReportSpamModal';

interface LiveDonorMapProps {
  onSelectDonor?: (donor: DonorDiscoveryProfile) => void;
  onRequestBlood?: () => void;
  onOpenCompatibilityModal?: () => void;
}

export const LiveDonorMap: React.FC<LiveDonorMapProps> = ({
  onSelectDonor,
  onRequestBlood,
  onOpenCompatibilityModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // User location & center (Default: Chennai 13.0827, 80.2707)
  const [centerLat, setCenterLat] = useState<number>(13.0827);
  const [centerLng, setCenterLng] = useState<number>(80.2707);
  const [locating, setLocating] = useState<boolean>(false);

  // Filters
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'All'>('All');
  const [filterCompatibleOnly, setFilterCompatibleOnly] = useState<boolean>(false);
  const [recipientBloodGroup, setRecipientBloodGroup] = useState<BloodGroup>('O+');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  // Data
  const [donors, setDonors] = useState<DonorDiscoveryProfile[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyBloodRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDonor, setSelectedDonor] = useState<DonorDiscoveryProfile | null>(null);
  const [selectedHospitalRequest, setSelectedHospitalRequest] = useState<EmergencyBloodRequest | null>(null);

  // Report Modal state
  const [reportingEntity, setReportingEntity] = useState<{ id: string; name: string; type: 'donor' | 'request' | 'hospital' } | null>(null);

  // Detect user location on initial load
  useEffect(() => {
    detectCurrentLocation(false);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer groups for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map view when center coordinates change
  useEffect(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([centerLat, centerLng], radiusToZoom(radiusKm));
    }
  }, [centerLat, centerLng, radiusKm]);

  // Fetch donors and active emergency requests
  const loadMapData = async () => {
    setLoading(true);
    try {
      const compatibleRecipient = filterCompatibleOnly ? recipientBloodGroup : null;
      const discovered = await searchNearbyDonors({
        centerLat,
        centerLng,
        radiusKm,
        bloodGroupFilter: filterCompatibleOnly ? undefined : selectedBloodGroup,
        compatibleForRecipient: compatibleRecipient,
        availabilityOnly: availableOnly
      });
      setDonors(discovered);

      const requests = await getAllEmergencyRequests();
      setEmergencyRequests(requests.filter(r => r.status !== 'Fulfilled' && r.status !== 'Cancelled'));
    } catch (e) {
      console.error('Error fetching map data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [centerLat, centerLng, radiusKm, selectedBloodGroup, filterCompatibleOnly, recipientBloodGroup, availableOnly]);

  // Render markers and radius circle on the Leaflet map
  useEffect(() => {
    const map = leafletMapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Draw Radius Boundary Circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }
    const radiusCircle = L.circle([centerLat, centerLng], {
      radius: radiusKm * 1000,
      color: '#DC2626',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#FEE2E2',
      fillOpacity: 0.12
    }).addTo(layer);
    radiusCircleRef.current = radiusCircle;

    // 2. Draw Center User Pin
    const centerIcon = L.divIcon({
      className: 'custom-center-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 bg-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold ring-4 ring-blue-300/50 animate-pulse">
            📍
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    L.marker([centerLat, centerLng], { icon: centerIcon, zIndexOffset: 1000 })
      .bindTooltip('Your Search Center', { permanent: false, direction: 'top' })
      .addTo(layer);

    // 3. Draw Donors (with approximate privacy circle and divIcon)
    donors.forEach((donor) => {
      const isAvailable = donor.status === 'available';

      // Privacy Circle around donor (~600m)
      L.circle([donor.approximateLocation.lat, donor.approximateLocation.lng], {
        radius: 600,
        color: isAvailable ? '#10B981' : '#9CA3AF',
        weight: 1,
        dashArray: '3, 3',
        fillColor: isAvailable ? '#D1FAE5' : '#F3F4F6',
        fillOpacity: 0.18
      }).addTo(layer);

      // High-contrast custom Donor Marker
      const donorIcon = L.divIcon({
        className: 'custom-donor-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95">
            <div class="w-10 h-10 rounded-2xl bg-white shadow-xl border-2 ${
              isAvailable ? 'border-red-500' : 'border-gray-300'
            } flex items-center justify-center font-black text-xs ${
              isAvailable ? 'text-red-600' : 'text-gray-400'
            }">
              ${donor.bloodGroup}
            </div>
            ${
              isAvailable 
                ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white shadow-sm"></span>' 
                : ''
            }
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([donor.approximateLocation.lat, donor.approximateLocation.lng], { icon: donorIcon });
      marker.on('click', () => {
        setSelectedDonor(donor);
        setSelectedHospitalRequest(null);
        if (onSelectDonor) onSelectDonor(donor);
      });
      marker.addTo(layer);
    });

    // 4. Draw Active Emergency Hospital Requisitions
    emergencyRequests.forEach((req) => {
      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 animate-bounce">
            <div class="w-11 h-11 rounded-2xl bg-red-600 text-white shadow-2xl border-2 border-white flex flex-col items-center justify-center text-[10px] font-black leading-none">
              <span class="text-xs">🏥</span>
              <span class="mt-0.5 text-[9px] font-black">${req.bloodGroup}</span>
            </div>
            <span class="absolute -bottom-1 w-2 h-2 bg-red-700 rotate-45"></span>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([req.lat, req.lng], { icon: hospitalIcon, zIndexOffset: 900 });
      marker.on('click', () => {
        setSelectedHospitalRequest(req);
        setSelectedDonor(null);
      });
      marker.addTo(layer);
    });

  }, [donors, emergencyRequests, centerLat, centerLng, radiusKm]);

  const detectCurrentLocation = (showAlert: boolean = true) => {
    if (!navigator.geolocation) {
      if (showAlert) alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenterLat(pos.coords.latitude);
        setCenterLng(pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation lookup failed:', err);
        setLocating(false);
        if (showAlert) {
          alert('Could not acquire GPS coordinates. Showing default regional center.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const radiusToZoom = (radius: number): number => {
    if (radius <= 2) return 14;
    if (radius <= 5) return 13;
    if (radius <= 10) return 12;
    return 11;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
      {/* Top Filter and Controls Bar */}
      <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-b border-gray-100 space-y-3 z-10 relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
              🗺️
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm leading-tight">Live Donor Discovery Map</h3>
              <p className="text-[11px] text-gray-500 font-medium">Privacy-protected coarsened locations (approx. ±650m)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => detectCurrentLocation(true)}
              disabled={locating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              title="Detect Current Location"
            >
              <Compass size={14} className={locating ? 'animate-spin' : ''} />
              <span>{locating ? 'Locating...' : 'My Location'}</span>
            </button>

            {onOpenCompatibilityModal && (
              <button
                onClick={onOpenCompatibilityModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-all"
                title="Blood Compatibility Matrix"
              >
                <Droplet size={14} />
                <span>Compatibility Matrix</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Filter Strip: Radius & Group Selection */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Radius Selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-700">
            <span className="px-2 text-gray-500 text-[11px]">Radius:</span>
            {[2, 5, 10, 25].map((r) => (
              <button
                key={'rad_' + r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  radiusKm === r ? 'bg-red-600 text-white shadow-sm' : 'hover:text-gray-900'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Availability Toggle */}
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              availableOnly 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Available Now</span>
          </button>

          {/* Compatibility Mode Switch */}
          <button
            onClick={() => setFilterCompatibleOnly(!filterCompatibleOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              filterCompatibleOnly
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span>🧪 Match for Recipient:</span>
            {filterCompatibleOnly ? (
              <select
                value={recipientBloodGroup}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setRecipientBloodGroup(e.target.value as BloodGroup)}
                className="bg-purple-800 text-white text-xs font-black rounded px-1.5 py-0.5 outline-none"
              >
                {ALL_BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            ) : (
              <span className="text-gray-400 font-normal">Off</span>
            )}
          </button>
        </div>

        {/* Blood Group Filter Pills (when not in compatible mode) */}
        {!filterCompatibleOnly && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-bold text-gray-500 shrink-0">Blood Group:</span>
            {(['All', ...ALL_BLOOD_GROUPS] as Array<BloodGroup | 'All'>).map((bg) => (
              <button
                key={'bg_' + bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 border transition-all ${
                  selectedBloodGroup === bg
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-gray-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Stats Badge */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-md border border-gray-200 text-xs text-gray-800 space-y-0.5">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{donors.length} Discovered Donors ({radiusKm} km)</span>
          </div>
          {emergencyRequests.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600">
              <span>🏥</span>
              <span>{emergencyRequests.length} Active Hospital Requisitions</span>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-xs flex items-center justify-center">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2.5 text-xs font-bold text-gray-700">
              <RefreshCw size={16} className="animate-spin text-red-600" />
              <span>Scanning nearby consenting donors...</span>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-blue-50/90 border-t border-blue-100 px-4 py-2.5 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-blue-600 shrink-0" />
          <span className="text-[11px] leading-tight">
            <strong>Donor Privacy Protected:</strong> Displayed pins reflect coarsened district coordinates (±650m). Exact residential addresses are never broadcasted.
          </span>
        </div>
      </div>

      {/* Selected Donor Drawer / Bottom Sheet */}
      {selectedDonor && (
        <div className="p-4 bg-white border-t border-gray-200 animate-in slide-in-from-bottom-2 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 min-w-[52px] rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-black text-2xl shadow-sm">
                {selectedDonor.bloodGroup}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-gray-900 text-base">{selectedDonor.name}</h4>
                  {selectedDonor.verifiedDonor && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="font-bold text-gray-700">{selectedDonor.approximateLocation.areaName}</span>
                  <span>•</span>
                  <span className="text-red-600 font-bold">~{selectedDonor.distanceKm} km away</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDonor(null)}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Status</span>
              <span className={`font-bold capitalize ${selectedDonor.status === 'available' ? 'text-emerald-600' : 'text-gray-600'}`}>
                {selectedDonor.status.replace('_', ' ')}
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Donations</span>
              <span className="font-bold text-gray-900">{selectedDonor.totalDonations} Completed</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Last Available</span>
              <span className="font-bold text-gray-700 truncate block">
                {new Date(selectedDonor.lastAvailableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`tel:${selectedDonor.phone}`}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Phone size={15} />
              <span>Contact Donor Directly</span>
            </a>

            <button
              onClick={() => setReportingEntity({ id: selectedDonor.id, name: selectedDonor.name, type: 'donor' })}
              className="px-3.5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Report suspicious behavior or commercial selling"
            >
              <ShieldAlert size={15} />
              <span>Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Hospital Requisition Drawer */}
      {selectedHospitalRequest && (
        <div className="p-4 bg-red-50/90 border-t border-red-200 animate-in slide-in-from-bottom-2 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 min-w-[52px] rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {selectedHospitalRequest.bloodGroup}
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-900 text-[10px] font-black uppercase tracking-wider">
                  {selectedHospitalRequest.urgency} Requirement
                </span>
                <h4 className="font-black text-gray-900 text-base mt-1">{selectedHospitalRequest.hospitalName}</h4>
                <p className="text-xs text-gray-600 font-medium">
                  {selectedHospitalRequest.city} • {selectedHospitalRequest.unitsRequired} Unit(s) {selectedHospitalRequest.bloodComponent}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedHospitalRequest(null)}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-red-950 bg-white/80 p-3 rounded-xl border border-red-100 font-medium">
            {selectedHospitalRequest.notes}
          </p>

          <div className="flex items-center gap-2">
            <a
              href={`/blood/${selectedHospitalRequest.id}`}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md text-center active:scale-95 transition-all"
            >
              View Request & Pledge Blood
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedHospitalRequest.hospitalName} ${selectedHospitalRequest.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
              title="Navigate in Google Maps"
            >
              <Navigation size={18} />
            </a>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingEntity && (
        <ReportSpamModal
          isOpen={!!reportingEntity}
          onClose={() => setReportingEntity(null)}
          targetId={reportingEntity.id}
          targetName={reportingEntity.name}
          targetType={reportingEntity.type}
          onBlocked={() => {
            setDonors(prev => prev.filter(d => d.id !== reportingEntity.id));
            setSelectedDonor(null);
          }}
        />
      )}
    </div>
  );
};
