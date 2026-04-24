const globalCountries = [];
let currentSort = {
    key: null, // 'name' or 'capital'
    asc: true  // true (A-Z), false (Z-A)
};

async function getCountries() {
    try {
        const response = await fetch(
            "https://restcountries.com/v3.1/all?fields=name,capital,currencies,flags"
        );
        const countries = await response.json();

        countries.forEach((country) => {
            const currencyKey = country.currencies ? Object.keys(country.currencies) : null;
            const currencyData = currencyKey ? country.currencies[currencyKey] : null;

            const normalized = {
                name: country.name.common,
                capital: (country.capital && country.capital.length > 0) ? country.capital[0] : "No Capital",
                currency: currencyData ? `${currencyData.name} (${currencyData.symbol || ''})` : "No Currency",
                flag: country.flags.svg,
            };

            globalCountries.push(normalized);
        });

        renderTable(globalCountries);

    } catch (error) {
        console.error("Data loading error:", error);
        document.getElementById("tableBody").innerHTML = 
            `<tr><td colspan="4" class="no-results">Error loading data. Please try again later.</td></tr>`;
    }
}

function renderTable(data) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="no-results">No matches found</td></tr>`;
        return;
    }

    data.forEach(country => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="country-name">${country.name}</td>
            <td>${country.capital}</td>
            <td>${country.currency}</td>
            <td><img src="${country.flag}" alt="Flag" class="flag-img"></td>
        `;
        tableBody.appendChild(row);
    });
}

function handleSearch() {
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    
    currentSort = { key: null, asc: true };
    updateSortIcons();

    const filtered = globalCountries.filter(c => 
        c.name.toLowerCase().includes(searchQuery) || 
        c.capital.toLowerCase().includes(searchQuery)
    );

    renderTable(filtered);
}

function sortData(key) {
    if (currentSort.key === key) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort.key = key;
        currentSort.asc = true;
    }

    updateSortIcons();

    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const dataToProcess = globalCountries.filter(c => 
        c.name.toLowerCase().includes(searchQuery) || 
        c.capital.toLowerCase().includes(searchQuery)
    );

    dataToProcess.sort((a, b) => {
        const valA = a[key].toLowerCase();
        const valB = b[key].toLowerCase();
        
        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
    });

    renderTable(dataToProcess);
}

function updateSortIcons() {
    const nameIcon = document.getElementById("name-icon");
    const capitalIcon = document.getElementById("capital-icon");

    [nameIcon, capitalIcon].forEach(icon => {
        if (icon) {
            icon.classList.remove("asc", "desc");
        }
    });

    if (currentSort.key) {
        const activeIcon = document.getElementById(`${currentSort.key}-icon`);
        if (activeIcon) {
            if (currentSort.asc) {
                activeIcon.classList.add("asc");
            } else {
                activeIcon.classList.add("desc");
            }
        }
    }
}

// Event Listeners
document.getElementById("searchButton").addEventListener("click", handleSearch);
document.getElementById("searchInput").addEventListener("input", handleSearch);

getCountries();
