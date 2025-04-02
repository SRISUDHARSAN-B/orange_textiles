import React, { useState } from 'react';

// --- Sample Data (Replace with actual backend API calls) ---
const initialYarns = [
    { id: 1, name: 'Cotton Yarn 40s', quantity: 1000, unit: 'kg', pricePerUnit: 200 },
    { id: 2, name: 'Silk Yarn 60s', quantity: 500, unit: 'kg', pricePerUnit: 400 },
    { id: 3, name: 'Polyester Yarn 30s', quantity: 800, unit: 'kg', pricePerUnit: 150 },
];

const initialDhotiTypes = [
    { id: 1, name: 'Cotton Dhoti - Plain White', productionCost: 150, requiredYarnPerPiece: 2 }, // Added requiredYarnPerPiece
    { id: 2, name: 'Silk Dhoti - Golden Border', productionCost: 300, requiredYarnPerPiece: 1.5 },
    { id: 3, name: 'Cotton Dhoti - Colored Stripes', productionCost: 180, requiredYarnPerPiece: 2.5 },
    { id: 4, name: 'Silk Dhoti - Silver Zari', productionCost: 350, requiredYarnPerPiece: 1.8 },
    { id: 5, name: 'Cotton Dhoti - Checked Pattern', productionCost: 200, requiredYarnPerPiece: 2.2 },
];

const initialDhoties = [
  {id: 1, typeId: 1, typeName: "Cotton Dhoti - Plain White", quantity: 50, productionCost: 150 },
  {id: 2, typeId: 2, typeName: "Silk Dhoti - Golden Border", quantity: 30, productionCost: 300 },
];

const initialSales = [
    { id: 1, dhotiId: 1, dhotiName: 'Cotton Dhoti - Plain White', quantity: 10, price: 2000, saleDate: '2024-07-28' },
    { id: 2, dhotiId: 2, dhotiName: 'Silk Dhoti - Golden Border', quantity: 5, price: 2500, saleDate: '2024-07-28' },
];

// --- Helper Functions ---
const calculateTotalCost = (yarns) => {
    return yarns.reduce((total, yarn) => total + (yarn.quantity * yarn.pricePerUnit), 0);
};

const calculateTotalRevenue = (sales) => {
    return sales.reduce((total, sale) => total + sale.price, 0);
};

const calculateTotalProfit = (yarns, sales, dhoties) => {
    const yarnCost = calculateTotalCost(yarns);
    const revenue = calculateTotalRevenue(sales);
    const productionCost = dhoties.reduce((total, dhoti) => total + (dhoti.quantity * dhoti.productionCost), 0);
    return revenue - (yarnCost + productionCost);
};

const calculateWastage = (initialYarns, dhoties, dhotiTypes) => {
    let totalYarnUsed = 0;
    dhoties.forEach(dhoti => {
        const dhotiType = dhotiTypes.find(type => type.id === dhoti.typeId);
        if (dhotiType) {
            totalYarnUsed += dhoti.quantity * dhotiType.requiredYarnPerPiece;
        }
    });

    const initialYarnQuantity = initialYarns.reduce((sum, yarn) => sum + yarn.quantity, 0);
    return initialYarnQuantity - totalYarnUsed;
};

function StockManagement() {
    // --- State ---
    const [yarns, setYarns] = useState(initialYarns);
    const [dhotiTypes, setDhotiTypes] = useState(initialDhotiTypes);
    const [dhoties, setDhoties] = useState(initialDhoties);
    const [sales, setSales] = useState(initialSales);
    const [newYarn, setNewYarn] = useState({ name: '', quantity: 0, unit: 'kg', pricePerUnit: 0 });
    const [newDhoti, setNewDhoti] = useState({ typeId: 1, quantity: 0 });
    const [newSale, setNewSale] = useState({ dhotiId: 1, quantity: 0, price: 0, saleDate: '' });
    const [showFinancials, setShowFinancials] = useState(false);

    // --- Handlers ---
    const handleYarnChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;

        let parsedValue = value;

        if (name === 'quantity' || name === 'pricePerUnit') {
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) {
                parsedValue = 0;
            }
        }

        setNewYarn({ ...newYarn, [name]: parsedValue });
    };


    const handleAddYarn = () => {
        if (!newYarn.name.trim() || newYarn.quantity <= 0 || newYarn.pricePerUnit <= 0) {
            alert('Please enter valid yarn details.');
            return;
        }
        setYarns([...yarns, { ...newYarn, id: yarns.length + 1 }]);
        setNewYarn({ name: '', quantity: 0, unit: 'kg', pricePerUnit: 0 });
    };

    const handleDhotiChange = (e) => {
        const value = parseInt(e.target.value, 10);
        const name = e.target.name;
        if (isNaN(value)) {
            setNewDhoti({ ...newDhoti, [name]: 0 });
        }
        else {
            setNewDhoti({ ...newDhoti, [name]: value });
        }

    };

    const handleProduceDhoti = () => {
        if (newDhoti.quantity <= 0) {
            alert("Please enter a valid quantity to produce.");
            return;
        }

        const selectedDhotiType = dhotiTypes.find((type) => type.id === newDhoti.typeId);
        if (selectedDhotiType) {
            let canProduce = true;
            const requiredYarn = newDhoti.quantity * selectedDhotiType.requiredYarnPerPiece;
            const updatedYarns = yarns.map(yarn => {
                if (yarn.quantity < requiredYarn) {
                    canProduce = false;
                }
                return { ...yarn, quantity: yarn.quantity - requiredYarn }
            });

            if (!canProduce) {
                alert("Not enough yarn available to produce this quantity of dhotis.");
                return;
            }
            setYarns(updatedYarns);

            const existingDhoti = dhoties.find(
                (d) => d.typeId === newDhoti.typeId
            );

            if (existingDhoti) {
                const updatedDhoties = dhoties.map((d) =>
                    d.typeId === newDhoti.typeId
                        ? { ...d, quantity: d.quantity + newDhoti.quantity }
                        : d
                );
                setDhoties(updatedDhoties);
            } else {
                setDhoties([
                    ...dhoties,
                    {
                        id: dhoties.length + 1,
                        ...newDhoti,
                        typeName: selectedDhotiType.name,
                        productionCost: selectedDhotiType.productionCost,
                    },
                ]);
            }

            setNewDhoti({ typeId: 1, quantity: 0 });
        } else {
            alert("Invalid dhoti type selected.");
        }
    };

    const handleSaleChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;

        let parsedValue = value;

        if (name === 'quantity' || name === 'price') {
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) {
                parsedValue = 0;
            }
        }
        setNewSale({ ...newSale, [name]: parsedValue });
    };

    const handleAddSale = () => {
        if (newSale.quantity <= 0 || newSale.price <= 0 || !newSale.saleDate) {
            alert("Please enter valid sale details.");
            return;
        }

        const selectedDhoti = dhoties.find((d) => d.id === newSale.dhotiId);
        if (selectedDhoti) {
            if (selectedDhoti.quantity < newSale.quantity) {
                alert("Not enough dhotis in stock to fulfill this sale.");
                return;
            }
            const updatedDhoties = dhoties.map((d) =>
                d.id === newSale.dhotiId ? { ...d, quantity: d.quantity - newSale.quantity } : d
            );
            setDhoties(updatedDhoties);

            setSales([...sales, { ...newSale, id: sales.length + 1, dhotiName: selectedDhoti.typeName }]);
            setNewSale({ dhotiId: 1, quantity: 0, price: 0, saleDate: '' });
        } else {
            alert("Invalid dhoti selected for sale.");
        }
    };

    // --- Calculations ---
    const totalYarnCost = calculateTotalCost(yarns);
    const totalRevenue = calculateTotalRevenue(sales);
    const totalProfit = calculateTotalProfit(yarns, sales, dhoties);
    const totalWastage = calculateWastage(initialYarns, dhoties, dhotiTypes);

    return (
        <div className="p-4" style={{ border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
            <h1 className="text-2xl font-bold mb-4" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Orange Textiles Stock Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yarn Management Section */}
                <div className="card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h2 className="card-title">Yarn Inventory</h2>
                        <p className="card-description">Manage your yarn stock</p>
                    </div>
                    <div className="card-body">
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                            <thead style={{ backgroundColor: '#f0f0f0' }}>
                                <tr>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>ID</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Name</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Quantity</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Unit</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Price/Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yarns.map((yarn) => (
                                    <tr key={yarn.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px' }}>{yarn.id}</td>
                                        <td style={{ padding: '8px' }}>{yarn.name}</td>
                                        <td style={{ padding: '8px' }}>{yarn.quantity}</td>
                                        <td style={{ padding: '8px' }}>{yarn.unit}</td>
                                        <td style={{ padding: '8px' }}>{yarn.pricePerUnit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 space-y-2" style={{ marginTop: '15px' }}>
                            <h3 className="text-lg font-semibold" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Add Yarn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Yarn Name"
                                    value={newYarn.name}
                                    onChange={handleYarnChange}
                                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={newYarn.quantity}
                                    onChange={handleYarnChange}
                                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <select
                                    onChange={(e) => handleYarnChange({ target: { name: 'unit', value: e.target.value } })}
                                    value={newYarn.unit}
                                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="">Unit</option>
                                    <option value="kg">kg</option>
                                    <option value="pounds">pounds</option>
                                    <option value="meters">meters</option>
                                </select>
                                <input
                                    type="number"
                                    name="pricePerUnit"
                                    placeholder="Price/Unit"
                                    value={newYarn.pricePerUnit}
                                    onChange={handleYarnChange}
                                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <button onClick={handleAddYarn} style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Yarn</button>
                        </div>
                    </div>
                </div>

                {/* Dhoti Production Section */}
                <div className="card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h2 className="card-title">Dhoti Production</h2>
                        <p className="card-description">Produce dhotis from available yarn</p>
                    </div>
                    <div className="card-body">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Produce Dhoti</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <select
                                        onChange={(e) => handleDhotiChange({ target: { name: 'typeId', value: e.target.value } })}
                                        value={newDhoti.typeId}
                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        <option value="">Dhoti Type</option>
                                        {dhotiTypes.map((type) => (
                                            <option key={type.id} value={type.id} >
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="Quantity"
                                        value={newDhoti.quantity}
                                        onChange={handleDhotiChange}
                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                                <button onClick={handleProduceDhoti} style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Produce</button>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Dhoti Inventory</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f0f0f0' }}>
                                        <tr>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>ID</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Type</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Quantity</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Production Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dhoties.map((dhoti) => (
                                            <tr key={dhoti.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '8px' }}>{dhoti.id}</td>
                                                <td style={{ padding: '8px' }}>{dhoti.typeName}</td>
                                                <td style={{ padding: '8px' }}>{dhoti.quantity}</td>
                                                <td style={{ padding: '8px' }}>{dhoti.productionCost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Management Section */}
                <div className="card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h2 className="card-title">Sales Management</h2>
                        <p className="card-description">Manage wholesale dhoti sales</p>
                    </div>
                    <div className="card-body">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Add Sale</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    <select
                                        onChange={(e) =>
                                            handleSaleChange({
                                                target: { name: "dhotiId", value: e.target.value },
                                            })
                                        }
                                        value={newSale.dhotiId}
                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        <option value="">Dhoti</option>
                                        {dhoties.map((dhoti) => (
                                            <option
                                                key={dhoti.id}
                                                value={dhoti.id}
                                            >
                                                {dhoti.typeName}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="Quantity"
                                        value={newSale.quantity}
                                        onChange={handleSaleChange}
                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="Price"
                                        value={newSale.price}
                                        onChange={handleSaleChange}
                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                    <input
                                        type="date"
                                        name="saleDate"
                                        placeholder="Sale Date"
                                        value={newSale.saleDate}
                                        onChange={handleSaleChange}
                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                                <button onClick={handleAddSale} style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Add Sale</button>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Sales History</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f0f0f0' }}>
                                        <tr>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>ID</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Dhoti</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Quantity</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Price</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Sale Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.map((sale) => (
                                            <tr key={sale.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '8px' }}>{sale.id}</td>
                                                <td style={{ padding: '8px' }}>{sale.dhotiName}</td>
                                                <td style={{ padding: '8px' }}>{sale.quantity}</td>
                                                <td style={{ padding: '8px' }}>{sale.price}</td>
                                                <td style={{ padding: '8px' }}>{sale.saleDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Overview Section */}
            <div className="card mt-6" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginTop: '20px' }}>
                <div className="card-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <h2 className="card-title">Financial Overview</h2>
                    <p className="card-description">
                        Summary of costs, revenue, and profit.
                        <button
                            className="ml-4"
                            onClick={() => setShowFinancials(!showFinancials)}
                            style={{ marginLeft: '10px', padding: '8px 12px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {showFinancials ? "Hide" : "Show"} Financials
                        </button>
                    </p>
                </div>
                <div className="card-body">
                    {showFinancials && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                            <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <h4 className="text-md font-semibold" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total Yarn Cost</h4>
                                <p className="text-lg" style={{ fontSize: '1.2em' }}>{totalYarnCost} ₹</p>
                            </div>
                            <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <h4 className="text-md font-semibold" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total Revenue</h4>
                                <p className="text-lg" style={{ fontSize: '1.2em' }}>{totalRevenue} ₹</p>
                            </div>
                            <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <h4 className="text-md font-semibold" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total Profit</h4>
                                <p className="text-lg" style={{ fontSize: '1.2em' }}>{totalProfit} ₹</p>
                            </div>
                            <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <h4 className="text-md font-semibold" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total Wastage</h4>
                                <p className="text-lg" style={{ fontSize: '1.2em' }}>{totalWastage} kg</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StockManagement;
