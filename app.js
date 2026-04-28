const { useState, useEffect } = React;

// --- SVGs as React Components (Lucide alternatives) ---
const Icons = {
    Fuel: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h12"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>,
    MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Wallet: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
    Weight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
    Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
    X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
};

// --- Custom Hooks ---
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}

// --- Main App Component ---
function App() {
    // Application State with LocalStorage persistence
    const [fuelPrice, setFuelPrice] = useLocalStorage('ts_fuelPrice', 1.85); // € per liter
    const [vehicleEfficiency, setVehicleEfficiency] = useLocalStorage('ts_vehicleEfficiency', 6.5); // L/100km
    const [carWeight, setCarWeight] = useLocalStorage('ts_carWeight', 1500); // kg
    
    const [tripLegs, setTripLegs] = useLocalStorage('ts_tripLegs', [
        { id: 1, destination: 'Berlin', distanceKm: 280 }
    ]);
    
    const [passengers, setPassengers] = useLocalStorage('ts_passengers', [
        { id: 1, name: 'Alice', weightKg: 65 },
        { id: 2, name: 'Bob', weightKg: 85 }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form Inputs State
    const [newLegDest, setNewLegDest] = useState('');
    const [newLegDist, setNewLegDist] = useState('');
    
    const [newPassName, setNewPassName] = useState('');
    const [newPassWeight, setNewPassWeight] = useState('');

    // --- Derived Math & Logic ---
    const totalDistance = tripLegs.reduce((acc, leg) => acc + (Number(leg.distanceKm) || 0), 0);
    // Formula: (Distance / 100) * (L/100km)
    const totalFuelLiters = (totalDistance / 100) * vehicleEfficiency;
    const totalFuelCost = totalFuelLiters * fuelPrice;
    
    const totalPassengerWeight = passengers.reduce((acc, p) => acc + (Number(p.weightKg) || 0), 0);
    const totalWeight = carWeight + totalPassengerWeight;

    // --- Handlers ---
    const addLeg = (e) => {
        e.preventDefault();
        if (!newLegDest || !newLegDist) return;
        setTripLegs([...tripLegs, { id: Date.now(), destination: newLegDest, distanceKm: Number(newLegDist) }]);
        setNewLegDest('');
        setNewLegDist('');
    };

    const removeLeg = (id) => {
        setTripLegs(tripLegs.filter(leg => leg.id !== id));
    };

    const addPassenger = (e) => {
        e.preventDefault();
        if (!newPassName || !newPassWeight) return;
        setPassengers([...passengers, { id: Date.now(), name: newPassName, weightKg: Number(newPassWeight) }]);
        setNewPassName('');
        setNewPassWeight('');
    };

    const removePassenger = (id) => {
        setPassengers(passengers.filter(p => p.id !== id));
    };

    const generateSummaryText = () => {
        let text = `🚗 TripSplit Summary\n`;
        text += `------------------------\n`;
        text += `Total Distance: ${totalDistance} km\n`;
        text += `Total Cost: €${totalFuelCost.toFixed(2)}\n`;
        text += `Total Weight Moved: ${totalWeight} kg\n`;
        text += `\n📍 Itinerary:\n`;
        if (tripLegs.length === 0) text += `- No destinations planned.\n`;
        tripLegs.forEach(leg => {
            text += `- ${leg.destination} (${leg.distanceKm} km)\n`;
        });
        text += `\n👥 Fair Cost Breakdown (Weight-based):\n`;
        if (passengers.length === 0) text += `- No passengers added.\n`;
        passengers.forEach(p => {
            const pShare = (p.weightKg + (carWeight / (passengers.length || 1))) / (totalWeight || 1);
            const pCost = totalFuelCost * pShare;
            text += `- ${p.name}: €${pCost.toFixed(2)} (${p.weightKg}kg)\n`;
        });
        return text;
    };

    return (
        <div className="min-h-screen bg-brand-slate text-slate-200 p-4 md:p-8 selection:bg-brand-emerald selection:text-white pb-20">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-brand-blue to-brand-emerald bg-clip-text text-transparent mb-2">
                        TripSplit
                    </h1>
                    <p className="text-slate-400 font-medium tracking-wide">The Ultimate Road Trip Architect</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 md:mt-0 flex items-center gap-2 bg-gradient-to-r from-brand-blue to-brand-emerald px-6 py-3 rounded-full text-white font-bold hover:shadow-lg hover:shadow-brand-emerald/20 transition-all transform hover:-translate-y-1"
                >
                    <Icons.Share /> Generate Summary
                </button>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT COLUMN: Settings & Passengers --- */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Vehicle Config Card */}
                    <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h12"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-brand-emerald">
                            <Icons.Fuel /> Vehicle Settings
                        </h2>
                        
                        <div className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Fuel Price (€/L)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={fuelPrice}
                                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Efficiency (L/100km)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={vehicleEfficiency}
                                    onChange={(e) => setVehicleEfficiency(Number(e.target.value))}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Car Weight (kg)</label>
                                <input 
                                    type="number" 
                                    step="1"
                                    value={carWeight}
                                    onChange={(e) => setCarWeight(Number(e.target.value))}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Passengers Config Card */}
                    <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-brand-blue relative z-10">
                            <Icons.Users /> Passengers
                        </h2>
                        
                        <form onSubmit={addPassenger} className="flex gap-2 mb-6 relative z-10">
                            <input 
                                type="text" 
                                placeholder="Name"
                                value={newPassName}
                                onChange={(e) => setNewPassName(e.target.value)}
                                className="w-[45%] bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                            />
                            <input 
                                type="number" 
                                placeholder="kg"
                                value={newPassWeight}
                                onChange={(e) => setNewPassWeight(e.target.value)}
                                className="w-[35%] bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                            />
                            <button type="submit" className="w-[20%] bg-brand-blue hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-brand-blue/20">
                                <Icons.Plus />
                            </button>
                        </form>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 relative z-10">
                            {passengers.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No passengers added.</p>}
                            {passengers.map(p => {
                                const pShare = (p.weightKg + (carWeight / (passengers.length || 1))) / (totalWeight || 1);
                                const pCost = totalFuelCost * pShare;
                                return (
                                    <div key={p.id} className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 hover:bg-slate-800/80 transition-colors">
                                        <div>
                                            <p className="font-semibold">{p.name}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Icons.Weight /> {p.weightKg} kg
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-brand-blue">€{pCost.toFixed(2)}</p>
                                            </div>
                                            <button onClick={() => removePassenger(p.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Dashboard & Trip Builder --- */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Summary Dashboard Card */}
                    <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-t border-l border-slate-700/50">
                        {/* Decorative glowing orbs */}
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-emerald/20 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-brand-blue/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs flex items-center gap-2"><Icons.MapPin /> TOTAL DISTANCE</p>
                                <p className="text-5xl lg:text-6xl font-extrabold text-white tracking-tight">{totalDistance} <span className="text-2xl text-slate-500">km</span></p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs flex items-center gap-2"><Icons.Wallet /> TOTAL FUEL COST</p>
                                <p className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight">€{totalFuelCost.toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <div className="relative z-10 mt-10 pt-8 border-t border-slate-700/50 flex flex-wrap gap-8 justify-between items-center bg-slate-900/30 p-6 rounded-2xl">
                            <div>
                                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Total Mass</p>
                                <p className="text-2xl font-bold text-slate-200">{totalWeight} <span className="text-sm text-slate-500">kg</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Avg. Cost / 100km</p>
                                <p className="text-2xl font-bold text-slate-200">€{(vehicleEfficiency * fuelPrice).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Cost / Liter</p>
                                <p className="text-2xl font-bold text-slate-200">€{fuelPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Trip Builder Card */}
                    <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-100 relative z-10">
                            <Icons.MapPin /> Itinerary Builder
                        </h2>
                        
                        <form onSubmit={addLeg} className="flex flex-col md:flex-row gap-3 mb-8 relative z-10">
                            <input 
                                type="text" 
                                placeholder="Destination (e.g. Paris)"
                                value={newLegDest}
                                onChange={(e) => setNewLegDest(e.target.value)}
                                className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                            />
                            <div className="flex gap-3">
                                <input 
                                    type="number" 
                                    placeholder="Distance (km)"
                                    value={newLegDist}
                                    onChange={(e) => setNewLegDist(e.target.value)}
                                    className="w-full md:w-36 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                                />
                                <button type="submit" className="px-6 md:px-8 bg-brand-emerald hover:bg-emerald-500 rounded-xl font-bold transition-colors shadow-lg shadow-brand-emerald/20 flex items-center justify-center">
                                    Add
                                </button>
                            </div>
                        </form>

                        <div className="space-y-4 relative z-10">
                            {tripLegs.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-2xl">
                                    <p className="text-slate-400">No destinations added yet. Start planning!</p>
                                </div>
                            )}
                            {tripLegs.map((leg, index) => (
                                <div key={leg.id} className="group flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-5 hover:bg-slate-800/80 transition-all shadow-sm hover:shadow-md">
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-900/80 flex items-center justify-center text-sm font-bold text-slate-300 border border-slate-700">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-white">{leg.destination}</p>
                                            {index > 0 && <p className="text-xs text-slate-400">From previous stop</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 ml-14 sm:ml-0">
                                        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                                            <p className="font-semibold text-brand-emerald">{leg.distanceKm} km</p>
                                        </div>
                                        <button onClick={() => removeLeg(leg.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10">
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- SHARE MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="glass w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl border border-slate-600 animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                            <Icons.X />
                        </button>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white"><Icons.Share /> Trip Summary</h3>
                        <textarea 
                            readOnly
                            className="w-full h-72 bg-slate-900 border border-slate-600 rounded-xl p-5 text-sm font-mono text-emerald-100 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none mb-6 shadow-inner"
                            value={generateSummaryText()}
                        ></textarea>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-white transition-colors"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(generateSummaryText());
                                    alert('Copied to clipboard!');
                                }}
                                className="flex-[2] py-3 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-xl font-bold text-white shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40 transition-all transform hover:-translate-y-0.5"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Render Application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
