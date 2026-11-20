import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Crosshair,
    MapPin,
    Navigation,
    Search,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Compass,
    Building2,
    CopyCheck,
    X,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ShippingMapPickerProps {
    originLat?: number;
    originLng?: number;
    originName?: string;
    latitude: number | null;
    longitude: number | null;
    cityName?: string;
    districtName?: string;
    provinceName?: string;
    targetLat?: number | null;
    targetLng?: number | null;
    onChange: (lat: number, lng: number, distanceKm: number) => void;
    onAddressSelect?: (address: string) => void;
}

interface SearchSuggestion {
    title: string;
    subtitle: string;
    latitude: number;
    longitude: number;
}

// Calculate road distance with urban tortuosity factor (1.28)
function calcDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(0.5, Math.round(R * c * 1.28 * 10) / 10);
}

// Custom modern destination pin icon (Teardrop pointer with precision needle)
function createDestPinIcon(): L.DivIcon {
    return L.divIcon({
        className: 'custom-modern-pin',
        html: `
            <div style="position: relative; width: 38px; height: 46px; cursor: grab;">
                <!-- Pulsing ground shadow -->
                <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 14px; height: 6px; background: rgba(0,0,0,0.35); border-radius: 50%; filter: blur(1.5px);"></div>
                <!-- Main Teardrop Marker -->
                <svg width="38" height="44" viewBox="0 0 38 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                    <path d="M19 0C8.50659 0 0 8.50659 0 19C0 29.8 15.5 41.5 18.1 43.4C18.6 43.8 19.4 43.8 19.9 43.4C22.5 41.5 38 29.8 38 19C38 8.50659 29.4934 0 19 0Z" fill="#E11D48"/>
                    <path d="M19 1.5C9.33502 1.5 1.5 9.33502 1.5 19C1.5 28.5 15.8 39.5 18.9 41.9C19 42 19 42 19.1 41.9C22.2 39.5 36.5 28.5 36.5 19C36.5 9.33502 28.665 1.5 19 1.5Z" stroke="white" stroke-width="2"/>
                    <circle cx="19" cy="18" r="7.5" fill="white"/>
                    <circle cx="19" cy="18" r="4" fill="#9F1239"/>
                </svg>
            </div>
        `,
        iconSize: [38, 46],
        iconAnchor: [19, 44],
        popupAnchor: [0, -44],
    });
}

// Origin store icon (Coffee roastery badge)
function createStorePinIcon(): L.DivIcon {
    return L.divIcon({
        className: 'custom-store-pin',
        html: `
            <div style="background-color: #2b1810; width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid #d4af37; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
                <span style="font-size: 15px; line-height: 1;">☕</span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
}

export function ShippingMapPicker({
    originLat = -7.9327,
    originLng = 112.6037,
    originName = 'Sanubari Roastery, Tlogomas',
    latitude,
    longitude,
    cityName = 'Kota Malang',
    districtName = '',
    provinceName = 'Jawa Timur',
    targetLat = null,
    targetLng = null,
    onChange,
    onAddressSelect,
}: ShippingMapPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [resolvedAddress, setResolvedAddress] = useState<string>('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const originMarkerRef = useRef<L.Marker | null>(null);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // Initial center: if target coordinates (city/subdistrict) are available and user hasn't set custom lat/lng
    const effectiveLat = latitude ?? targetLat ?? originLat;
    const effectiveLng = longitude ?? targetLng ?? originLng;
    const hasPinpoint = latitude !== null && longitude !== null;

    const distanceKm = hasPinpoint
        ? calcDistanceKm(originLat, originLng, latitude, longitude)
        : null;

    // Fetch reverse geocode address for coordinates
    const fetchReverseAddress = useCallback(
        async (lat: number, lng: number) => {
            setIsGeocoding(true);
            try {
                const res = await fetch(
                    `/api/shipping/places/reverse?lat=${lat}&lng=${lng}`,
                );
                const json = await res.json();
                if (json.success && json.data) {
                    const addr =
                        json.data.short_address || json.data.display_name;
                    setResolvedAddress(addr);
                }
            } catch {
                // Ignore error silently
            } finally {
                setIsGeocoding(false);
            }
        },
        [],
    );

    // Initial reverse geocode on mount if pinpoint exists
    useEffect(() => {
        if (latitude !== null && longitude !== null && !resolvedAddress) {
            fetchReverseAddress(latitude, longitude);
        }
    }, [latitude, longitude, fetchReverseAddress, resolvedAddress]);

    // Cleanup Leaflet map on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Initialize or refresh map when isOpen changes
    useEffect(() => {
        if (!isOpen) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
                originMarkerRef.current = null;
            }
            return;
        }

        const container = mapContainerRef.current;
        if (!container) return;

        // Initialize Leaflet map
        const map = L.map(container, {
            center: [effectiveLat, effectiveLng],
            zoom: 16,
            zoomControl: false,
        });
        mapInstanceRef.current = map;

        // Add Zoom Control to bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer with fast OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Origin marker (Roastery)
        originMarkerRef.current = L.marker([originLat, originLng], {
            icon: createStorePinIcon(),
        })
            .addTo(map)
            .bindTooltip(
                `<b>${originName}</b><br><span style="font-size:11px;">Titik Asal Toko</span>`,
                { direction: 'top', offset: [0, -30] },
            );

        // Customer destination pinpoint marker
        const destMarker = L.marker([effectiveLat, effectiveLng], {
            draggable: true,
            icon: createDestPinIcon(),
        }).addTo(map);
        markerRef.current = destMarker;

        destMarker.bindTooltip(
            '<div style="text-align:center; font-weight:bold; font-size:11px;">Titik Lokasi Anda<br><span style="font-weight:normal; font-size:10px; color:#666;">(Geser pin tepat ke rumah)</span></div>',
            { permanent: false, direction: 'top', offset: [0, -42] },
        );

        // Handle marker drag
        destMarker.on('dragend', (e) => {
            const pos = (e.target as L.Marker).getLatLng();
            const dist = calcDistanceKm(
                originLat,
                originLng,
                pos.lat,
                pos.lng,
            );
            const nLat = Number(pos.lat.toFixed(6));
            const nLng = Number(pos.lng.toFixed(6));
            onChange(nLat, nLng, dist);
            fetchReverseAddress(nLat, nLng);
        });

        // Handle map click
        map.on('click', (e: L.LeafletMouseEvent) => {
            destMarker.setLatLng(e.latlng);
            const dist = calcDistanceKm(
                originLat,
                originLng,
                e.latlng.lat,
                e.latlng.lng,
            );
            const nLat = Number(e.latlng.lat.toFixed(6));
            const nLng = Number(e.latlng.lng.toFixed(6));
            onChange(nLat, nLng, dist);
            fetchReverseAddress(nLat, nLng);
        });

        // Invalidate size after layout rendering
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => {
            clearTimeout(timer);
        };
    }, [isOpen]);

    // When target city/district coordinates change and user hasn't explicitly set a pinpoint
    useEffect(() => {
        if (!isOpen || !mapInstanceRef.current || !markerRef.current) return;
        if (targetLat !== null && targetLng !== null && !hasPinpoint) {
            mapInstanceRef.current.flyTo([targetLat, targetLng], 15, {
                duration: 1.0,
            });
            markerRef.current.setLatLng([targetLat, targetLng]);
        }
    }, [targetLat, targetLng, isOpen, hasPinpoint]);

    // Live search debounced query
    const handleQueryChange = (val: string) => {
        setSearchQuery(val);
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        if (val.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        searchDebounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const params = new URLSearchParams({
                    q: val.trim(),
                    city: cityName || '',
                    district: districtName || '',
                    province: provinceName || '',
                });

                const res = await fetch(
                    `/api/shipping/places/search?${params.toString()}`,
                );
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setSuggestions(json.data);
                    setShowSuggestions(json.data.length > 0);
                }
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setIsSearching(false);
            }
        }, 320);
    };

    // When a search suggestion is clicked
    const selectSuggestion = (s: SearchSuggestion) => {
        setShowSuggestions(false);
        setSearchQuery(s.title);
        const dist = calcDistanceKm(
            originLat,
            originLng,
            s.latitude,
            s.longitude,
        );

        onChange(s.latitude, s.longitude, dist);
        setResolvedAddress(s.subtitle ? `${s.title}, ${s.subtitle}` : s.title);

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo([s.latitude, s.longitude], 17, {
                duration: 1.2,
            });
            markerRef.current.setLatLng([s.latitude, s.longitude]);
        }
    };

    // Use Device GPS
    const handleUseGPS = () => {
        if (!navigator.geolocation) {
            alert('Perangkat Anda tidak mendukung fitur lokasi GPS.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsLocating(false);
                const uLat = Number(pos.coords.latitude.toFixed(6));
                const uLng = Number(pos.coords.longitude.toFixed(6));
                const dist = calcDistanceKm(originLat, originLng, uLat, uLng);

                onChange(uLat, uLng, dist);
                fetchReverseAddress(uLat, uLng);

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.flyTo([uLat, uLng], 17, {
                        duration: 1.2,
                    });
                    markerRef.current.setLatLng([uLat, uLng]);
                }
            },
            (err) => {
                setIsLocating(false);
                alert(
                    'Tidak dapat mendeteksi GPS: ' +
                        err.message +
                        '. Silakan gunakan pencarian alamat atau geser pin manual pada peta.',
                );
            },
            { enableHighAccuracy: true, timeout: 12000 },
        );
    };

    // Center map to selected city/district
    const handleCenterToTarget = () => {
        const destLat = targetLat ?? originLat;
        const destLng = targetLng ?? originLng;
        const dist = calcDistanceKm(originLat, originLng, destLat, destLng);

        onChange(destLat, destLng, dist);
        fetchReverseAddress(destLat, destLng);

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo([destLat, destLng], 15, {
                duration: 1.0,
            });
            markerRef.current.setLatLng([destLat, destLng]);
        }
    };

    return (
        <div className="space-y-3 rounded-2xl border border-sand-300 bg-sand-50/70 p-3.5 sm:p-4 transition-all">
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-rose-600 flex-shrink-0" />
                        <h4 className="text-xs font-bold text-brand-950 sm:text-sm">
                            Titik Lokasi Pin Peta Pengiriman
                        </h4>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            Akurasi GoSend & Biteship
                        </span>
                    </div>
                    <p className="text-[11px] text-brand-600">
                        {hasPinpoint
                            ? `📍 Titik terpasang: ${latitude}, ${longitude} (${distanceKm} km dari Roastery)`
                            : 'Tentukan titik peta agar kurir instan dan ekspedisi dapat mengantar akurat ke depan pintu Anda.'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="hover:bg-sand-100 inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-3 py-1.5 text-xs font-bold text-brand-900 shadow-2xs transition-colors"
                >
                    <Crosshair className="h-3.5 w-3.5 text-brand-700" />
                    <span>
                        {isOpen
                            ? 'Tutup Peta'
                            : hasPinpoint
                              ? 'Ubah Titik Peta'
                              : 'Buka Peta Pinpoint'}
                    </span>
                </button>
            </div>

            {/* Quick Actions (When Map is closed) */}
            {!isOpen && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(true);
                            setTimeout(handleUseGPS, 300);
                        }}
                        disabled={isLocating}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                    >
                        {isLocating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Navigation className="h-3.5 w-3.5" />
                        )}
                        <span>Gunakan Lokasi GPS Saya Saat Ini</span>
                    </button>

                    {targetLat !== null && targetLng !== null && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(true);
                                setTimeout(handleCenterToTarget, 300);
                            }}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-sand-100"
                        >
                            <Compass className="h-3.5 w-3.5 text-brand-600" />
                            <span>
                                Pusatkan ke {districtName ? `Kec. ${districtName}` : cityName}
                            </span>
                        </button>
                    )}

                    {hasPinpoint && distanceKm !== null && (
                        <div className="inline-flex items-center gap-1 rounded-xl border border-sand-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>
                                Jarak: <strong>{distanceKm} km</strong> (
                                {distanceKm <= 25
                                    ? '⚡ Jangkauan GoSend Instan'
                                    : 'Kurir Ekspedisi Regular'}
                                )
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Expanded Interactive Map Box */}
            {isOpen && (
                <div className="space-y-3 border-t border-sand-200 pt-3">
                    {/* Search Bar with live autocomplete */}
                    <div className="relative z-20">
                        <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleQueryChange(e.target.value)
                                    }
                                    onFocus={() => {
                                        if (suggestions.length > 0) {
                                            setShowSuggestions(true);
                                        }
                                    }}
                                    placeholder={`Ketik nama jalan, perumahan, toko, atau gedung di ${cityName || 'Indonesia'}...`}
                                    className="w-full rounded-xl border border-sand-300 bg-white py-2.5 pr-8 pl-9 text-xs text-brand-950 placeholder-brand-400 focus:border-brand-700 focus:outline-hidden sm:text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSuggestions([]);
                                            setShowSuggestions(false);
                                        }}
                                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-brand-400 hover:text-brand-700"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleUseGPS}
                                disabled={isLocating}
                                title="Gunakan Lokasi GPS Saya"
                                className="inline-flex flex-shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {isLocating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Navigation className="h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">GPS Saya</span>
                            </button>

                            {targetLat !== null && targetLng !== null && (
                                <button
                                    type="button"
                                    onClick={handleCenterToTarget}
                                    title={`Arahkan peta ke ${districtName || cityName}`}
                                    className="inline-flex flex-shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-xs font-bold text-brand-800 transition-colors hover:bg-sand-100"
                                >
                                    <Compass className="h-4 w-4 text-brand-600" />
                                    <span className="hidden sm:inline">
                                        Pusatkan
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Search Autocomplete Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-sand-300 bg-white shadow-xl">
                                <div className="p-1.5">
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => selectSuggestion(s)}
                                            className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-sand-50"
                                        >
                                            <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-bold text-brand-950 truncate">
                                                    {s.title}
                                                </div>
                                                {s.subtitle && (
                                                    <div className="text-[11px] text-brand-500 truncate">
                                                        {s.subtitle}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isSearching && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-sand-200 bg-white p-2.5 text-center text-xs text-brand-500 shadow-lg">
                                <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin text-brand-600" />
                                Mencari lokasi di peta...
                            </div>
                        )}
                    </div>

                    {/* Interactive Leaflet Map Box */}
                    <div className="relative overflow-hidden rounded-xl border border-sand-300 shadow-sm">
                        <div
                            ref={mapContainerRef}
                            className="relative z-0 h-80 w-full"
                        />

                        {/* Top Overlay Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10 rounded-lg bg-brand-950/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs shadow-md">
                            🎯 <strong>Petunjuk:</strong> Klik peta atau geser pin merah tepat ke depan rumah Anda
                        </div>

                        {/* Floating Distance Badge */}
                        {distanceKm !== null && (
                            <div className="absolute bottom-2.5 left-2.5 z-10 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-brand-950 shadow-md backdrop-blur-xs">
                                🚗 Jarak dari Roastery:{' '}
                                <span className="text-rose-600 font-extrabold">
                                    {distanceKm} km
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Resolved Street Address Card */}
                    {resolvedAddress && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sand-200 bg-white p-3 text-xs shadow-2xs">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                                <div className="min-w-0">
                                    <span className="font-semibold text-brand-950">
                                        Alamat Titik Terpilih:
                                    </span>{' '}
                                    <span className="text-brand-700">
                                        {resolvedAddress}
                                    </span>
                                </div>
                            </div>

                            {onAddressSelect && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onAddressSelect(resolvedAddress);
                                        setCopiedAddress(true);
                                        setTimeout(() => setCopiedAddress(false), 2000);
                                    }}
                                    className="hover:bg-sand-100 flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-2.5 py-1 text-[11px] font-bold text-brand-800 transition-colors"
                                >
                                    <CopyCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>
                                        {copiedAddress
                                            ? 'Alamat Disalin!'
                                            : 'Salin ke Alamat Lengkap'}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
