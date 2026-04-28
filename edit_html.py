import re

def process_file():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS for Bottom Nav and Drawer
    css_addition = """
        /* Hide the default Leaflet Routing Container */
        .leaflet-routing-container {
            display: none !important;
        }

        /* Mobile specific bottom padding for safe area */
        .safe-pb {
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        
        .bottom-nav {
            padding-bottom: env(safe-area-inset-bottom, 0px);
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        
        /* Drawer animation */
        .drawer-overlay {
            background-color: rgba(0, 0, 0, 0.5);
            transition: opacity 0.3s ease;
        }
        .drawer-content {
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-open .drawer-content {
            transform: translateY(0);
        }
        
        /* Touch Target Size */
        .touch-target {
            min-width: 44px;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
"""
    content = content.replace("/* Hide the default Leaflet Routing Container */\n        .leaflet-routing-container {\n            display: none !important;\n        }", css_addition)

    # 2. Add State to Dashboard
    dashboard_sig = "function Dashboard({ currentUser, onLogout }) {"
    new_state = """function Dashboard({ currentUser, onLogout }) {
            const [activeMobileTab, setActiveMobileTab] = useState('map'); // 'map', 'expenses', 'drivers', 'bingo'
            const [isLegDrawerOpen, setIsLegDrawerOpen] = useState(false);
            const [isExpDrawerOpen, setIsExpDrawerOpen] = useState(false);"""
    content = content.replace(dashboard_sig, new_state)

    # 3. Increase font size for inputs on mobile (change text-sm to text-base)
    # Be careful not to replace text-sm inside button or non-input classes if we want to keep them small.
    # Actually, the user says: "Ensure all inputs use font-size: 16px to prevent iOS from auto-zooming when a user taps a field."
    # We can just inject a global CSS rule for inputs.
    global_css_input = """
        input, select, textarea {
            font-size: 16px !important;
        }
"""
    content = content.replace("/* Hide the default Leaflet Routing Container */", global_css_input + "/* Hide the default Leaflet Routing Container */")

    # 4. Map Height
    content = content.replace('h-[400px]', 'h-[50vh]')

    # 5. Mobile Tabs & Wrapping
    # Replace `<div className="max-w-7xl mx-auto mb-8">` (Map Section)
    content = content.replace('<div className="max-w-7xl mx-auto mb-8">', '<div className={`max-w-7xl mx-auto mb-8 p-4 md:p-0 ${activeMobileTab !== "map" ? "hidden lg:block" : ""}`}>')

    # Configuration section (Drivers)
    content = content.replace('<div className="lg:col-span-1 space-y-10 animate-slide-up" style={{ animationDelay: \'0.2s\' }}>', '<div className={`lg:col-span-1 space-y-10 animate-slide-up p-4 md:p-0 ${activeMobileTab !== "drivers" ? "hidden lg:block" : ""}`} style={{ animationDelay: \'0.2s\' }}>')

    # Results section (Expenses)
    content = content.replace('<div className="lg:col-span-2 space-y-10 animate-slide-up" style={{ animationDelay: \'0.3s\' }}>', '<div className={`lg:col-span-2 space-y-10 animate-slide-up p-4 md:p-0 ${(activeMobileTab !== "expenses" && activeMobileTab !== "bingo") ? "hidden lg:block" : ""}`} style={{ animationDelay: \'0.3s\' }}>')

    # 6. Touch Targets
    content = content.replace('<button onClick={() => removeWaypoint(waypoint.id)} className="p-2', '<button onClick={() => removeWaypoint(waypoint.id)} className="p-2 touch-target')
    content = content.replace('<button onClick={() => removePassenger(p.id)} className="text-slate-600', '<button onClick={() => removePassenger(p.id)} className="text-slate-600 touch-target')
    content = content.replace('<button onClick={() => removeMiscExpense(exp.id)} className="text-slate-700', '<button onClick={() => removeMiscExpense(exp.id)} className="text-slate-700 touch-target')

    # 7. Bingo Grid
    content = content.replace('className="grid grid-cols-4 gap-2 md:gap-4 mb-10"', 'className="overflow-x-auto pb-4"><div className="grid grid-cols-4 sm:grid-cols-4 gap-2 md:gap-4 mb-10 min-w-[320px]"')
    content = content.replace('</button>);\n                                    })}\n                                </div>', '</button>);\n                                    })}\n                                </div></div>')

    # 8. Bottom Nav Bar Component
    bottom_nav = """
                    {/* Bottom Navigation for Mobile */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bottom-nav border-t border-white/10 z-[3000] flex justify-around items-center pt-2">
                        <button onClick={() => setActiveMobileTab('map')} className={`flex flex-col items-center p-2 touch-target ${activeMobileTab === 'map' ? 'text-brand-blue' : 'text-slate-500'}`}>
                            <Icons.MapPin size={24} />
                            <span className="text-[10px] font-bold mt-1">Map</span>
                        </button>
                        <button onClick={() => setActiveMobileTab('expenses')} className={`flex flex-col items-center p-2 touch-target ${activeMobileTab === 'expenses' ? 'text-brand-emerald' : 'text-slate-500'}`}>
                            <Icons.Wallet size={24} />
                            <span className="text-[10px] font-bold mt-1">Ledger</span>
                        </button>
                        <button onClick={() => setActiveMobileTab('drivers')} className={`flex flex-col items-center p-2 touch-target ${activeMobileTab === 'drivers' ? 'text-brand-blue' : 'text-slate-500'}`}>
                            <Icons.Users size={24} />
                            <span className="text-[10px] font-bold mt-1">Drivers</span>
                        </button>
                        <button onClick={() => setIsBingoModalOpen(true)} className={`flex flex-col items-center p-2 touch-target ${activeMobileTab === 'bingo' ? 'text-amber-400' : 'text-slate-500'}`}>
                            <Icons.Gamepad size={24} />
                            <span className="text-[10px] font-bold mt-1">Bingo</span>
                        </button>
                    </div>
    """
    
    # 9. Drawers
    drawers = """
                    {/* Leg Drawer for Mobile */}
                    <div className={`lg:hidden fixed inset-0 z-[4000] pointer-events-none`}>
                        <div className={`absolute inset-0 drawer-overlay pointer-events-auto ${isLegDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsLegDrawerOpen(false)}></div>
                        <div className={`absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 drawer-content pointer-events-auto ${isLegDrawerOpen ? 'drawer-open' : ''}`}>
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
                            <h3 className="text-lg font-black text-white mb-4">Manage Trip Legs</h3>
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-4">
                                {tripWaypoints.map((wp, index) => (
                                    <WaypointInput key={wp.id} index={index} waypoint={wp} updateWaypoint={updateWaypoint} removeWaypoint={removeWaypoint} canRemove={tripWaypoints.length > 2} isActive={activeWaypointId === wp.id} onActivate={() => setActiveWaypointId(wp.id)} />
                                ))}
                            </div>
                            <div className="flex gap-4 mb-8">
                                <button onClick={addWaypoint} className="w-full bg-brand-blue hover:bg-blue-400 py-3 rounded-xl font-black text-white transition-all">Add Destination</button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Expense Drawer for Mobile */}
                    <div className={`lg:hidden fixed inset-0 z-[4000] pointer-events-none`}>
                        <div className={`absolute inset-0 drawer-overlay pointer-events-auto ${isExpDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsExpDrawerOpen(false)}></div>
                        <div className={`absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 drawer-content pointer-events-auto safe-pb ${isExpDrawerOpen ? 'drawer-open' : ''}`}>
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
                            <h3 className="text-lg font-black text-brand-emerald mb-4">Add Expense</h3>
                            <form onSubmit={(e) => { addMiscExpense(e); setIsExpDrawerOpen(false); }} className="space-y-4 mb-8">
                                <input type="text" placeholder="Expense Name" value={newExpName} onChange={(e) => setNewExpName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-emerald/50" />
                                <input type="number" step="0.01" placeholder="€ Amount" value={newExpAmount} onChange={(e) => setNewExpAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-emerald/50" />
                                <select value={newExpPayerId} onChange={(e) => setNewExpPayerId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 text-sm"><option value="" disabled>Who Paid?</option>{passengers.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                                <button type="submit" className="w-full bg-brand-emerald hover:bg-emerald-400 py-4 rounded-xl flex items-center justify-center transition-all shadow-lg text-slate-900 font-black">Save Expense</button>
                            </form>
                        </div>
                    </div>
    """
    
    # Insert Bottom Nav and Drawers before Dashboard return ends
    content = content.replace('                    {showWizard && (', bottom_nav + drawers + '                    {showWizard && (')

    # 10. Hide desktop forms on mobile and replace with "Open Drawer" buttons
    # Waypoint list
    content = content.replace('<div className="space-y-2">', '<div className="hidden lg:block space-y-2">')
    content = content.replace('<div className="flex gap-4 mt-6 pl-11">', '<div className="hidden lg:flex gap-4 mt-6 pl-11">')
    # Add mobile button for Waypoints
    content = content.replace('<h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-white mb-6 md:mb-8 tracking-tight"><Icons.MapPin /> Trip Stops</h2>', '<h2 className="text-xl md:text-2xl font-black flex items-center justify-between gap-3 text-white mb-6 md:mb-8 tracking-tight"><span><Icons.MapPin className="inline mr-2" /> Trip Stops</span><button onClick={() => setIsLegDrawerOpen(true)} className="lg:hidden text-[10px] uppercase font-black text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-lg border border-brand-blue/20 touch-target">Manage Legs</button></h2>')

    # Expense Form
    content = content.replace('<form onSubmit={addMiscExpense} className="flex flex-col md:flex-row gap-4 mb-10">', '<form onSubmit={addMiscExpense} className="hidden lg:flex flex-col md:flex-row gap-4 mb-10">')
    content = content.replace('<h2 className="text-xl md:text-2xl font-black mb-6 md:mb-10 flex items-center gap-3 text-brand-emerald tracking-tight"><Icons.Receipt /> Group Equity Ledger</h2>', '<h2 className="text-xl md:text-2xl font-black mb-6 md:mb-10 flex items-center justify-between gap-3 text-brand-emerald tracking-tight"><span><Icons.Receipt className="inline mr-2" /> Group Equity Ledger</span><button onClick={() => setIsExpDrawerOpen(true)} className="lg:hidden text-[10px] uppercase font-black text-brand-emerald bg-brand-emerald/10 px-3 py-1.5 rounded-lg border border-brand-emerald/20 touch-target">Add Expense</button></h2>')

    # Main Dashboard wrapper padding
    content = content.replace('className="min-h-screen bg-brand-slate text-slate-200 p-4 md:p-8 selection:bg-brand-emerald selection:text-white pb-20"', 'className="min-h-screen bg-brand-slate text-slate-200 selection:bg-brand-emerald selection:text-white safe-pb lg:p-8 lg:pb-20"')

    # Fix Float Recap on Mobile Map
    # Ensure it's floating above the map. "with a floating Recap card at the bottom"
    # It is already floating: absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000]

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    process_file()
