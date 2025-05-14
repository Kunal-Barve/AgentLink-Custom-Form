// Main Alpine.js component for form handling
function formHandler() {
    return {
        // Form state
        currentStep: 1,
        totalSteps: 10,
        errorMessage: '',
        addressComponents: null,
        
        // Form data object to store all user inputs
        formData: {
            // Step 1: Agent Type
            agentType: '',
            
            // Step 2: Property Type
            propertyType: '',
            
            // Step 3: Total Area
            totalArea: '',
            
            // Step 4: Bedrooms
            bedrooms: '',
            
            // Step 5: Conditional questions based on Agent Type
            leaseDuration: '',
            intentToSell: '',
            
            // Step 6: Estimated values based on property and agent type
            estimatedRentalResidential: '',
            estimatedRentalCommercial: '',
            estimatedSaleValue: '',
            
            // Step 7-8: Agent information
            agentContacted: '',
            agentName: '',
            
            // Step 9: Address (populated by Google Places)
            address: '',
            
            // Step 10: Contact Information
            name: '',
            mobileNumber: '',
            email: ''
        },
        
        // Computed property for progress bar
        get formProgress() {
            return (this.currentStep / this.totalSteps) * 100;
        },
        
        // Initialize the component
        init() {
            // Set up the global handler for Google Places
            window.handlePlaceSelect = (place) => this.handlePlaceSelect(place);
            
            // Add a watcher for currentStep
            this.$watch('currentStep', (value) => {
                console.log('Step changed to:', value);
            });
            
            // Log initialization
            console.log('Form handler initialized');
        },
        
        // Navigation methods
        nextStep() {
            // Validate current step before proceeding
            if (this.validateCurrentStep()) {
                // Handle conditional navigation based on form data
                if (this.currentStep === 5) {
                    // After step 5, route based on agent type and property type
                    if (this.formData.agentType === 'leasing') {
                        if (['house', 'unit', 'townhouse', 'villa'].includes(this.formData.propertyType)) {
                            // For residential properties, go to residential rental estimate
                            this.currentStep = 6;
                        } else {
                            // For commercial/land, go to commercial rental estimate
                            this.currentStep = 6;
                        }
                    } else {
                        // For selling, go to sale value estimate
                        this.currentStep = 6;
                    }
                } else if (this.currentStep === 7 && this.formData.agentContacted === 'no') {
                    // Skip agent name step if they haven't contacted an agent
                    this.currentStep = 9;
                } else {
                    // Normal progression
                    this.currentStep++;
                }
                
                // Clear any previous error messages
                this.errorMessage = '';
            }
        },
        
        previousStep() {
            // Handle conditional navigation when going back
            if (this.currentStep === 9 && this.formData.agentContacted === 'no') {
                // Skip back to agent contacted question
                this.currentStep = 7;
            } else if (this.currentStep === 6) {
                // Always go back to step 5 from step 6
                this.currentStep = 5;
            } else {
                // Normal regression
                this.currentStep--;
            }
        },
        
        // Validation method for the current step
        validateCurrentStep() {
            switch (this.currentStep) {
                case 1:
                    if (!this.formData.agentType) {
                        this.errorMessage = 'Please select an agent type';
                        return false;
                    }
                    break;
                case 2:
                    if (!this.formData.propertyType) {
                        this.errorMessage = 'Please select a property type';
                        return false;
                    }
                    break;
                case 3:
                    if (!this.formData.totalArea) {
                        this.errorMessage = 'Please select a total area';
                        return false;
                    }
                    break;
                case 4:
                    if (!this.formData.bedrooms) {
                        this.errorMessage = 'Please select the number of bedrooms';
                        return false;
                    }
                    break;
                case 5:
                    if (this.formData.agentType === 'leasing' && !this.formData.leaseDuration) {
                        this.errorMessage = 'Please select a lease duration';
                        return false;
                    } else if (this.formData.agentType === 'selling' && !this.formData.intentToSell) {
                        this.errorMessage = 'Please select your intent to sell';
                        return false;
                    }
                    break;
                case 6:
                    if (this.formData.agentType === 'leasing') {
                        if (['house', 'unit', 'townhouse', 'villa'].includes(this.formData.propertyType) && 
                            !this.formData.estimatedRentalResidential) {
                            this.errorMessage = 'Please select an estimated rental value';
                            return false;
                        } else if (['commercial', 'land'].includes(this.formData.propertyType) && 
                                  !this.formData.estimatedRentalCommercial) {
                            this.errorMessage = 'Please select an estimated rental value';
                            return false;
                        }
                    } else if (this.formData.agentType === 'selling' && !this.formData.estimatedSaleValue) {
                        this.errorMessage = 'Please select an estimated sale value';
                        return false;
                    }
                    break;
                case 7:
                    if (!this.formData.agentContacted) {
                        this.errorMessage = 'Please indicate if you have contacted an agent';
                        return false;
                    }
                    break;
                case 8:
                    if (this.formData.agentContacted === 'yes' && !this.formData.agentName) {
                        this.errorMessage = 'Please enter the agent name';
                        return false;
                    }
                    break;
                case 9:
                    // Address validation is handled by submitAddress method
                    break;
                case 10:
                    // Final form validation is handled by submitForm method
                    break;
            }
            return true;
        },
        
        // Helper method to determine if the property type is residential
        isResidentialProperty() {
            const residentialTypes = ['house', 'unit', 'townhouse', 'villa'];
            return residentialTypes.includes(this.formData.propertyType);
        },
        
        // Handle the selected place from Google Places Autocomplete
        handlePlaceSelect(place) {
            console.log('Place selected:', place);
            
            // Store the formatted address
            this.formData.address = place.formatted_address;
            
            // Extract address components
            this.addressComponents = {
                street_number: '',
                route: '',
                locality: '',
                administrative_area_level_1: '',
                postal_code: '',
                country: ''
            };
            
            // Process each address component
            for (const component of place.address_components) {
                const types = component.types;
                
                if (types.includes('street_number')) {
                    this.addressComponents.street_number = component.long_name;
                } else if (types.includes('route')) {
                    this.addressComponents.route = component.long_name;
                } else if (types.includes('locality')) {
                    this.addressComponents.locality = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    this.addressComponents.administrative_area_level_1 = component.short_name;
                } else if (types.includes('postal_code')) {
                    this.addressComponents.postal_code = component.long_name;
                } else if (types.includes('country')) {
                    this.addressComponents.country = component.long_name;
                }
            }
            
            console.log('Extracted address components:', this.addressComponents);
        },
        
        // First submission - after address step
        submitAddress() {
            // Validate that we have address components
            if (!this.addressComponents || !this.formData.address) {
                this.errorMessage = 'Please enter and select a valid address';
                return;
            }
            
            // Check for required address components
            if (!this.addressComponents.street_number || !this.addressComponents.route) {
                this.errorMessage = 'Please select an address with a valid street number and name';
                return;
            }
            
            console.log('Address submission:', this.formData.address);
            
            // Here you would typically make an API call to save the first part of the form
            // For now, we'll just simulate a successful submission
            
            // First submission - collect data up to this point
            const firstSubmissionData = {
                agentType: this.formData.agentType,
                propertyType: this.formData.propertyType,
                totalArea: this.formData.totalArea,
                bedrooms: this.formData.bedrooms,
                // Include conditional fields based on agent type
                ...(this.formData.agentType === 'leasing' ? { leaseDuration: this.formData.leaseDuration } : {}),
                ...(this.formData.agentType === 'selling' ? { intentToSell: this.formData.intentToSell } : {}),
                // Include conditional rental/sale estimates
                ...(this.formData.agentType === 'leasing' && this.isResidentialProperty() ? 
                    { estimatedRentalResidential: this.formData.estimatedRentalResidential } : {}),
                ...(this.formData.agentType === 'leasing' && !this.isResidentialProperty() ? 
                    { estimatedRentalCommercial: this.formData.estimatedRentalCommercial } : {}),
                ...(this.formData.agentType === 'selling' ? 
                    { estimatedSaleValue: this.formData.estimatedSaleValue } : {}),
                agentContacted: this.formData.agentContacted,
                ...(this.formData.agentContacted === 'yes' ? { agentName: this.formData.agentName } : {}),
                // Address data
                address: this.formData.address,
                addressComponents: this.addressComponents
            };
            
            console.log('First part submission data:', firstSubmissionData);
            
            // Move to the next step (contact information)
            this.currentStep = 10;
            this.errorMessage = '';
        },
        
        // Final form submission
        submitForm() {
            // Validate contact information
            if (!this.formData.name) {
                this.errorMessage = 'Please enter your name';
                return;
            }
            
            if (!this.formData.mobileNumber) {
                this.errorMessage = 'Please enter your mobile number';
                return;
            }
            
            if (!this.formData.email) {
                this.errorMessage = 'Please enter your email address';
                return;
            }
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.formData.email)) {
                this.errorMessage = 'Please enter a valid email address';
                return;
            }
            
            // Prepare the complete form data for submission
            const completeFormData = {
                ...this.formData,
                addressComponents: this.addressComponents
            };
            
            console.log('Form submission:', completeFormData);
            
            // Here you would typically make an API call to submit the form
            // For now, we'll just simulate a successful submission
            alert('Form submitted successfully! Check the console for the submitted data.');
            
            // Reset the form after successful submission
            this.resetForm();
        },
        
        // Reset the form to initial state
        resetForm() {
            this.currentStep = 1;
            this.errorMessage = '';
            this.addressComponents = null;
            
            // Reset all form data fields
            Object.keys(this.formData).forEach(key => {
                this.formData[key] = '';
            });
        }
    };
}

// Google Maps Autocomplete initialization
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