function formHandler() {
    return {
        // Form state
        currentStep: 1,
        formProgress: 0,
        errorMessage: '',
        
        // Address data
        addressSelected: false,
        addressData: null,
        addressComponents: {
            street_number: '',
            route: '',
            locality: '',
            administrative_area_level_1: '',
            postal_code: '',
            country: ''
        },
        
        // Initialization
        init() {
            this.updateProgress();
            
            // Add a method to handle place data from Google Maps
            window.handlePlaceSelect = (place) => {
                this.handlePlaceData(place);
            };
        },
        
        // Methods
        updateProgress() {
            // Calculate form progress based on current step
            const totalSteps = 3; // Adjust based on your form's total steps
            this.formProgress = Math.round((this.currentStep / totalSteps) * 100);
        },
        
        handlePlaceData(place) {
            if (!place || !place.geometry) {
                console.error("Invalid place data");
                return;
            }
            
            console.log('Place address components:', place.address_components);
            
            // Update the address components
            this.updateAddressComponents(place.address_components);
            
            // Set address data
            this.addressData = {
                formatted_address: place.formatted_address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
            
            this.addressSelected = true;
            this.errorMessage = '';
        },
        
        submitAddress() {
            if (!this.addressSelected) {
                this.errorMessage = 'Please select a valid address.';
                return;
            }
            
            // Send incomplete submission to Make.com webhook
            this.sendIncompleteSubmission()
                .then(() => {
                    this.currentStep = 2;
                    this.updateProgress();
                })
                .catch(error => {
                    console.error('Error sending incomplete submission:', error);
                    // Continue anyway to not block the user
                    this.currentStep = 2;
                    this.updateProgress();
                });
        },
        
        sendIncompleteSubmission() {
            // Simulate API call for now
            return new Promise((resolve) => {
                console.log('Sending incomplete submission with address:', this.addressData);
                setTimeout(resolve, 500);
            });
        },
        
        extractAddressComponents(components) {
            const result = {};
            
            components.forEach(component => {
                const type = component.types[0];
                result[type] = component.long_name;
                
                if (type === 'administrative_area_level_1') {
                    result.state_short = component.short_name;
                }
            });
            
            return result;
        },
        
        updateAddressComponents(components) {
            // Reset components first
            this.addressComponents = {
                street_number: '',
                route: '',
                locality: '',
                administrative_area_level_1: '',
                postal_code: '',
                country: ''
            };
            
            // Extract and update address components
            components.forEach(component => {
                // Check all types, not just the first one
                component.types.forEach(type => {
                    if (this.addressComponents.hasOwnProperty(type)) {
                        this.addressComponents[type] = component.long_name;
                    }
                });
            });
            
            // Debug log to see what components were found
            console.log('Updated address components:', this.addressComponents);
        }
    };
}

// Define initAutocomplete in the global scope
window.initAutocomplete = function() {
    // Get the input element
    const autocompleteInput = document.getElementById('autocomplete');
    
    // Create the autocomplete object with Australia restriction
    const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, {
        componentRestrictions: { country: 'au' },
        fields: ["address_components", "formatted_address", "geometry"],
        types: ["address"],
    });
    
    // Focus the input
    autocompleteInput.focus();
    
    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener("place_changed", function() {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            console.error("No details available for input: '" + autocompleteInput.value + "'");
            return;
        }
        
        // Use the global handler function that's bound to the Alpine component
        if (typeof window.handlePlaceSelect === 'function') {
            window.handlePlaceSelect(place);
        } else {
            console.error("handlePlaceSelect function not found");
        }
    });
};