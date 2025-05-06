function formHandler() {
    return {
        // Form state
        currentStep: 1,
        formProgress: 0,
        errorMessage: '',
        
        // Address data
        addressSelected: false,
        addressData: null,
        
        // Initialization
        init() {
            this.updateProgress();
        },
        
        // Methods
        updateProgress() {
            // Calculate form progress based on current step
            const totalSteps = 3; // Adjust based on your form's total steps
            this.formProgress = Math.round((this.currentStep / totalSteps) * 100);
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
        }
        
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
            
            // Extract each component
            components.forEach(component => {
                const types = component.types;
                
                if (types.includes('street_number')) {
                    this.addressComponents.street_number = component.long_name;
                }
                
                if (types.includes('route')) {
                    this.addressComponents.route = component.long_name;
                }
                
                if (types.includes('locality')) {
                    this.addressComponents.locality = component.long_name;
                }
                
                if (types.includes('administrative_area_level_1')) {
                    this.addressComponents.administrative_area_level_1 = component.short_name;
                }
                
                if (types.includes('postal_code')) {
                    this.addressComponents.postal_code = component.long_name;
                }
                
                if (types.includes('country')) {
                    this.addressComponents.country = component.long_name;
                }
            });
        }
    };
}