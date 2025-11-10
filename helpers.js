class Helpers {
    static parseJSONString(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            this.showError('Invalid JSON format');
            return null;
        }
    }

    static stringifyObject(obj) {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            console.error('Error stringifying object:', error);
            return '{}';
        }
    }

    static getValueByDotNotation(obj, key) {
        return obj ? obj[key] : undefined;
    }

    static getValueByBracketNotation(obj, key) {
        return obj ? obj[key] : undefined;
    }

    static loopObjectProperties(obj) {
        if (!obj) return 'No object provided';
        
        let result = 'Object Properties:\n';
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result += `${key}: ${obj[key]}\n`;
            }
        }
        return result;
    }

    static loopArrayItems(arr) {
        if (!arr || !Array.isArray(arr)) return 'No array provided';
        
        let result = 'Array Items:\n';
        for (let i = 0; i < arr.length; i++) {
            result += `Item ${i}: ${arr[i]}\n`;
        }
        return result;
    }

    static storeData(key, data) {
        try {
            const jsonString = JSON.stringify(data);
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            console.error('Error storing data:', error);
            return false;
        }
    }

    static retrieveData(key) {
        try {
            const jsonString = localStorage.getItem(key);
            if (jsonString) {
                return JSON.parse(jsonString);
            }
            return null;
        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    }

    static parseProductData() {
        const jsonString = '{"productID":"P001","desc":"magazine","price":13.50}';
        const product = this.parseJSONString(jsonString);
        
        if (product) {
            return {
                id: product.productID,
                description: product.desc,
                price: product.price
            };
        }
        return null;
    }

    static parseStudentData() {
        const jsonString = '{"studentID":"BCS2011-001","studentName":"Äminah","program":"DCS","subjectTaken":["SAD","DAD","OOP"]}';
        const student = this.parseJSONString(jsonString);
        
        if (student) {
            return {
                id: student.studentID,
                name: student.studentName,
                program: student.program,
                subjects: student.subjectTaken
            };
        }
        return null;
    }

    static showError(message) {
        alert(`Error: ${message}`);
    }

    static showSuccess(message) {
        alert(`Success: ${message}`);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static validateRequiredFields(fields) {
        for (const [key, value] of Object.entries(fields)) {
            if (!value || value.toString().trim() === '') {
                return { isValid: false, field: key };
            }
        }
        return { isValid: true };
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

window.Helpers = Helpers;

window.demonstrateJSONParse = function() {
    const jsonString = '{"name":"John", "age":30, "city":"New York"}';
    const obj = Helpers.parseJSONString(jsonString);
    
    const output = document.getElementById('demo-output');
    if (output && obj) {
        output.innerHTML = `<strong>JSON.parse() Example:</strong>\n\n` +
                          `Original JSON: ${jsonString}\n\n` +
                          `Parsed Object:\n` +
                          `- Name: ${obj.name}\n` +
                          `- Age: ${obj.age}\n` +
                          `- City: ${obj.city}`;
    }
};

window.demonstrateJSONStringify = function() {
    const obj = { 
        name: "John", 
        age: 30, 
        city: "New York",
        hobbies: ["reading", "gaming", "coding"]
    };
    const jsonString = Helpers.stringifyObject(obj);
    
    const output = document.getElementById('demo-output');
    if (output) {
        output.innerHTML = `<strong>JSON.stringify() Example:</strong>\n\n` +
                          `Original Object: ${JSON.stringify(obj)}\n\n` +
                          `Stringified JSON:\n${jsonString}`;
    }
};

window.demonstrateLocalStorage = function() {
    const sampleData = {
        bookTitle: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        year: 1925,
        read: true
    };
    
    const storageKey = 'demoBookData';
    Helpers.storeData(storageKey, sampleData);
    
    const retrievedData = Helpers.retrieveData(storageKey);
    
    const output = document.getElementById('demo-output');
    if (output) {
        output.innerHTML = `<strong>Local Storage Example:</strong>\n\n` +
                          `Stored Data: ${JSON.stringify(sampleData)}\n\n` +
                          `Retrieved Data: ${JSON.stringify(retrievedData)}\n\n` +
                          `Data accessed with dot notation:\n` +
                          `- Title: ${retrievedData.bookTitle}\n` +
                          `- Author: ${retrievedData.author}`;
    }
};