     // Optimized JavaScript with better performance and error handling
        
        // DOM elements cache
        const elements = {
            dateInput: document.getElementById('dateInput'),
            resultDiv: document.getElementById('result'),
            convertBtn: document.getElementById('convertBtn'),
            copyBtn: document.getElementById('copyBtn'),
            audioBtn: document.getElementById('audioBtn'),
            shareBtn: document.getElementById('shareBtn'),
            themeToggle: document.getElementById('themeToggle'),
            themeIcon: document.getElementById('themeIcon'),
            body: document.body,
            historyList: document.getElementById('historyList'),
            historyCount: document.getElementById('historyCount'),
            conversionCount: document.getElementById('conversionCount'),
            copiedCount: document.getElementById('copiedCount'),
            sharedCount: document.getElementById('sharedCount'),
            achievementBadge: document.getElementById('achievementBadge'),
            installPrompt: document.getElementById('installPrompt'),
            installBtn: document.getElementById('installBtn')
        };

        // Auto add slashes and only allow numbers
        elements.dateInput.addEventListener('input', function(e) {
            let value = this.value.replace(/[^0-9]/g, '');
            
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            if (value.length > 5) {
                value = value.substring(0, 5) + '/' + value.substring(5, 9);
            }
            
            this.value = value.substring(0, 10);
        });

        // Theme toggle functionality
        elements.themeToggle.addEventListener('click', () => {
            if (elements.body.getAttribute('data-theme') === 'dark') {
                elements.body.removeAttribute('data-theme');
                elements.themeIcon.classList.remove('fa-sun');
                elements.themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            } else {
                elements.body.setAttribute('data-theme', 'dark');
                elements.themeIcon.classList.remove('fa-moon');
                elements.themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            }
        });

        // Check for saved theme preference
        if (localStorage.getItem('theme') === 'dark') {
            elements.body.setAttribute('data-theme', 'dark');
            elements.themeIcon.classList.remove('fa-moon');
            elements.themeIcon.classList.add('fa-sun');
        }

        // Initialize stats from localStorage
        let stats = JSON.parse(localStorage.getItem('stats')) || {
            conversions: 0,
            copies: 0,
            shares: 0
        };

        elements.conversionCount.textContent = stats.conversions;
        elements.copiedCount.textContent = stats.copies;
        elements.sharedCount.textContent = stats.shares;

        // Initialize history from localStorage
        let history = JSON.parse(localStorage.getItem('history')) || [];
        
        // Update history display
        function updateHistoryDisplay() {
            elements.historyList.innerHTML = '';
            elements.historyCount.textContent = history.length;
            
            // Display up to 5 most recent items
            const displayItems = history.slice(0, 5);
            
            displayItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'history-item hover-grow';
                li.innerHTML = `
                    <span class="history-item-date">${item.date}</span>
                    <span class="history-item-action" onclick="removeHistoryItem(${index}, event)"><i class="fas fa-times"></i></span>
                `;
                li.addEventListener('click', () => {
                    elements.dateInput.value = item.original;
                    convertDate();
                });
                elements.historyList.appendChild(li);
            });
        }

        function removeHistoryItem(index, event) {
            event.stopPropagation(); // Prevent the parent click event
            history.splice(index, 1);
            localStorage.setItem('history', JSON.stringify(history));
            updateHistoryDisplay();
            showAlert("ইতিহাস থেকে মুছে ফেলা হয়েছে", "success");
        }

        function addToHistory(originalDate, convertedDate) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            history.unshift({
                original: originalDate,
                converted: convertedDate,
                date: timeString
            });
            
            // Keep only the last 20 items
            if (history.length > 20) {
                history = history.slice(0, 20);
            }
            
            localStorage.setItem('history', JSON.stringify(history));
            updateHistoryDisplay();
        }

        function fillExample(date) {
            elements.dateInput.value = date;
            convertDate();
        }

        function clearDate() {
            elements.dateInput.value = '';
            elements.dateInput.focus();
        }

        async function pasteDate() {
            const pasteBtn = document.querySelector('.input-btn:not(.clear-btn)');
            const originalIcon = pasteBtn.innerHTML;
            
            try {
                // Show loading state
                pasteBtn.innerHTML = `<span class="spinner"></span>`;
                pasteBtn.disabled = true;
                
                const text = await navigator.clipboard.readText();
                const cleanedText = text.replace(/[^0-9]/g, '');
                let formattedText = cleanedText;
                
                if (cleanedText.length > 2) {
                    formattedText = cleanedText.substring(0, 2) + '/' + cleanedText.substring(2);
                }
                if (cleanedText.length > 4) {
                    formattedText = formattedText.substring(0, 5) + '/' + formattedText.substring(5, 9);
                }
                
                elements.dateInput.value = formattedText.substring(0, 10);
                convertDate();
                
                // Show success briefly
                pasteBtn.innerHTML = `<i class="fas fa-check"></i>`;
                setTimeout(() => {
                    pasteBtn.innerHTML = originalIcon;
                    pasteBtn.disabled = false;
                }, 1000);
            } catch (err) {
                showAlert("পেস্ট করতে সমস্যা হয়েছে, অনুগ্রহ করে ম্যানুয়ালি লিখুন", "warning");
                pasteBtn.innerHTML = originalIcon;
                pasteBtn.disabled = false;
                console.error('Failed to read clipboard contents: ', err);
            }
        }

        // Date conversion functions
        const days = [
            '', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 
            'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 
            'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 
            'Nineteenth', 'Twentieth', 'Twenty First', 'Twenty Second', 
            'Twenty Third', 'Twenty Fourth', 'Twenty Fifth', 'Twenty Sixth', 
            'Twenty Seventh', 'Twenty Eighth', 'Twenty Ninth', 'Thirtieth', 
            'Thirty First'
        ];
        
        const months = [
            '', 'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        function convertDay(day) {
            return days[day] || '';
        }
        
        function convertMonth(month) {
            return months[month] || '';
        }
        
        function convertYear(year) {
            return year >= 2000 ? convertYearAfter2000(year) : convertYearBefore2000(year);
        }
        
        function convertYearAfter2000(year) {
            const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
                          'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 
                          'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            
            const thousand = Math.floor(year / 1000);
            const hundred = Math.floor((year % 1000) / 100);
            const ten = Math.floor((year % 100) / 10);
            const unit = year % 10;
            
            let yearWords = [];
            
            if (thousand > 0) {
                yearWords.push(units[thousand] + ' Thousand');
            }
            
            if (hundred > 0) {
                yearWords.push(units[hundred] + ' Hundred');
            }
            
            if (ten > 1) {
                yearWords.push(tens[ten]);
                if (unit > 0) {
                    yearWords.push(units[unit]);
                }
            } else if (ten === 1) {
                yearWords.push(teens[unit]);
            } else if (unit > 0) {
                yearWords.push(units[unit]);
            }
            
            return yearWords.join(' ');
        }
        
        function convertYearBefore2000(year) {
            const century = Math.floor(year / 100);
            const decade = year % 100;
            
            const centuryNames = {
                19: 'Nineteen',
                18: 'Eighteen',
                17: 'Seventeen',
                16: 'Sixteen',
                15: 'Fifteen',
                14: 'Fourteen',
                13: 'Thirteen',
                12: 'Twelve',
                11: 'Eleven',
                10: 'Ten'
            };
            
            let centuryPart = centuryNames[century] || '';
            
            let decadePart = '';
            
            if (decade === 0) {
                decadePart = 'Hundred';
            } else if (decade < 10) {
                decadePart = 'O ' + convertDay(decade).toLowerCase();
            } else if (decade < 20) {
                const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 
                               'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
                decadePart = teens[decade - 10];
            } else {
                const ten = Math.floor(decade / 10);
                const unit = decade % 10;
                const tens = ['Twenty', 'Thirty', 'Forty', 'Fifty', 
                              'Sixty', 'Seventy', 'Eighty', 'Ninety'];
                decadePart = tens[ten - 2];
                if (unit > 0) {
                    decadePart += ' ' + convertDay(unit).toLowerCase();
                }
            }
            
            return centuryPart + ' ' + decadePart;
        }

        function convertDate() {
            const dateInput = elements.dateInput.value;
            const originalContent = elements.convertBtn.innerHTML;
            
            // Show loading state
            elements.convertBtn.innerHTML = `<span class="spinner"></span> কনভার্ট হচ্ছে...`;
            elements.convertBtn.disabled = true;
            
            // Simulate processing delay for better UX
            setTimeout(() => {
                // Validate the date format
                if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
                    elements.resultDiv.innerHTML = `<span style="color: var(--danger-color)">অনুগ্রহ করে সঠিক ফরম্যাটে তারিখ লিখুন (DD/MM/YYYY)</span>`;
                    elements.convertBtn.innerHTML = originalContent;
                    elements.convertBtn.disabled = false;
                    return;
                }
                
                const parts = dateInput.split('/');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                
                // Validate day, month and year
                if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1000 || year > 9999) {
                    elements.resultDiv.innerHTML = `<span style="color: var(--danger-color)">অনুগ্রহ করে একটি বৈধ তারিখ লিখুন (20/08/1982 এই রকম) ও (1000-9999 সাল পর্যন্ত)</span>`;
                    elements.convertBtn.innerHTML = originalContent;
                    elements.convertBtn.disabled = false;
                    return;
                }
                
                // Additional validation for days in month
                const daysInMonth = new Date(year, month, 0).getDate();
                if (day > daysInMonth) {
                    elements.resultDiv.innerHTML = `<span style="color: var(--danger-color)">${month} মাসে ${day} তারিখ নেই (সর্বোচ্চ ${daysInMonth})</span>`;
                    elements.convertBtn.innerHTML = originalContent;
                    elements.convertBtn.disabled = false;
                    return;
                }
                
                // Convert to English words
                const dayWord = convertDay(day);
                const monthWord = convertMonth(month);
                const yearWord = convertYear(year);
                
                const convertedText = `"${dayWord} of ${monthWord} ${yearWord}"`;
                elements.resultDiv.innerHTML = `<strong style="color: var(--primary-color)">${convertedText}</strong>`;
                elements.resultDiv.classList.add('pulse');
                setTimeout(() => elements.resultDiv.classList.remove('pulse'), 1500);
                
                // Update stats
                stats.conversions++;
                elements.conversionCount.textContent = stats.conversions;
                localStorage.setItem('stats', JSON.stringify(stats));
                
                // Add to history
                addToHistory(dateInput, convertedText);
                
                // Check achievements
                checkAchievements();
                
                elements.convertBtn.innerHTML = `<i class="fas fa-check icon"></i> কনভার্ট সম্পন্ন!`;
                setTimeout(() => {
                    elements.convertBtn.innerHTML = originalContent;
                    elements.convertBtn.disabled = false;
                }, 1000);
            }, 500); // Simulated processing delay
        }
        
        function copyToClipboard() {
            const textToCopy = elements.resultDiv.textContent.replace(/"/g, '').trim();
            const originalContent = elements.copyBtn.innerHTML;
            
            if (!textToCopy || textToCopy.includes("অনুগ্রহ")) {
                showAlert("কোন ফলাফল নেই, প্রথমে তারিখ কনভার্ট করুন", "warning");
                return;
            }
            
            // Show loading state
            elements.copyBtn.innerHTML = `<span class="spinner"></span> কপি করা হচ্ছে...`;
            elements.copyBtn.disabled = true;
            
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Update stats
                    stats.copies++;
                    elements.copiedCount.textContent = stats.copies;
                    localStorage.setItem('stats', JSON.stringify(stats));
                    
                    showAlert("ইংরেজি তারিখ কপি করা হয়েছে!", "success");
                    elements.copyBtn.innerHTML = `<i class="fas fa-check icon"></i> কপি সম্পন্ন!`;
                    setTimeout(() => {
                        elements.copyBtn.innerHTML = originalContent;
                        elements.copyBtn.disabled = false;
                    }, 1000);
                    
                    // Create confetti effect
                    createConfetti();
                    
                    // Check achievements
                    checkAchievements();
                })
                .catch(err => {
                    console.error('কপি করতে ব্যর্থ: ', err);
                    showAlert("কপি করতে ব্যর্থ, অনুগ্রহ করে ম্যানুয়ালি কপি করুন", "danger");
                    elements.copyBtn.innerHTML = originalContent;
                    elements.copyBtn.disabled = false;
                });
        }

        function createConfetti() {
            const colors = ['#4369a5', '#5a8ca5', '#ff7e5f', '#9f7aea', '#38b2ac'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = Math.random() * 10 + 5 + 'px';
                confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }
        }

        function speakDate() {
            const textToSpeak = elements.resultDiv.textContent.replace(/"/g, '').trim();
            
            if (!textToSpeak || textToSpeak.includes("অনুগ্রহ")) {
                showAlert("কোন ফলাফল নেই, প্রথমে তারিখ কনভার্ট করুন", "warning");
                return;
            }
            
            const originalContent = elements.audioBtn.innerHTML;
            
            // Show loading state
            elements.audioBtn.innerHTML = `<span class="spinner"></span> প্রস্তুত হচ্ছে...`;
            elements.audioBtn.disabled = true;
            
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                
                utterance.onend = function() {
                    elements.audioBtn.innerHTML = originalContent;
                    elements.audioBtn.disabled = false;
                };
                
                speechSynthesis.speak(utterance);
                
                // Show speaking state
                elements.audioBtn.innerHTML = `<i class="fas fa-volume-up icon"></i> বলা হচ্ছে...`;
            } else {
                showAlert("আপনার ব্রাউজার টেক্সট-টু-স্পিচ সাপোর্ট করে না", "warning");
                elements.audioBtn.innerHTML = originalContent;
                elements.audioBtn.disabled = false;
            }
        }

        function shareDate() {
            const textToShare = elements.resultDiv.textContent.replace(/"/g, '').trim();
            
            if (!textToShare || textToShare.includes("অনুগ্রহ")) {
                showAlert("কোন ফলাফল নেই, প্রথমে তারিখ কনভার্ট করুন", "warning");
                return;
            }
            
            const originalContent = elements.shareBtn.innerHTML;
            
            // Show loading state
            elements.shareBtn.innerHTML = `<span class="spinner"></span> শেয়ার হচ্ছে...`;
            elements.shareBtn.disabled = true;
            
            if (navigator.share) {
                navigator.share({
                    title: 'ইংরেজিতে জন্ম তারিখ',
                    text: `আমার জন্ম তারিখ ইংরেজিতে: ${textToShare}`,
                    url: window.location.href
                })
                .then(() => {
                    // Update stats
                    stats.shares++;
                    elements.sharedCount.textContent = stats.shares;
                    localStorage.setItem('stats', JSON.stringify(stats));
                    
                    elements.shareBtn.innerHTML = `<i class="fas fa-check icon"></i> শেয়ার সম্পন্ন!`;
                    setTimeout(() => {
                        elements.shareBtn.innerHTML = originalContent;
                        elements.shareBtn.disabled = false;
                    }, 1000);
                    
                    // Check achievements
                    checkAchievements();
                })
                .catch(err => {
                    console.log('Error sharing:', err);
                    elements.shareBtn.innerHTML = originalContent;
                    elements.shareBtn.disabled = false;
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const shareText = `আমার জন্ম তারিখ ইংরেজিতে: ${textToShare}\n\n${window.location.href}`;
                
                // Try to copy to clipboard as fallback
                navigator.clipboard.writeText(shareText)
                    .then(() => {
                        // Update stats
                        stats.shares++;
                        elements.sharedCount.textContent = stats.shares;
                        localStorage.setItem('stats', JSON.stringify(stats));
                        
                        showAlert("শেয়ার লিংক কপি করা হয়েছে! আপনি এখন এটি পেস্ট করতে পারেন", "success");
                        elements.shareBtn.innerHTML = `<i class="fas fa-check icon"></i> শেয়ার সম্পন্ন!`;
                        setTimeout(() => {
                            elements.shareBtn.innerHTML = originalContent;
                            elements.shareBtn.disabled = false;
                        }, 1000);
                        
                        // Check achievements
                        checkAchievements();
                    })
                    .catch(err => {
                        console.error('কপি করতে ব্যর্থ: ', err);
                        showAlert("শেয়ার করতে ব্যর্থ, অনুগ্রহ করে ম্যানুয়ালি শেয়ার করুন", "danger");
                        elements.shareBtn.innerHTML = originalContent;
                        elements.shareBtn.disabled = false;
                    });
            }
        }
        
        function showAlert(message, type) {
            const alertDiv = document.createElement('div');
            alertDiv.textContent = message;
            alertDiv.style.position = 'fixed';
            alertDiv.style.top = '20px';
            alertDiv.style.left = '50%';
            alertDiv.style.transform = 'translateX(-50%)';
            alertDiv.style.padding = '14px 28px';
            alertDiv.style.borderRadius = '10px';
            alertDiv.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            alertDiv.style.zIndex = '1000';
            alertDiv.style.animation = 'fadeIn 0.3s ease-out';
            alertDiv.style.fontWeight = '500';
            alertDiv.style.display = 'flex';
            alertDiv.style.alignItems = 'center';
            alertDiv.style.gap = '10px';
            
            // Add icon based on type
            let iconClass = 'fas fa-info-circle';
            if (type === 'success') iconClass = 'fas fa-check-circle';
            if (type === 'warning') iconClass = 'fas fa-exclamation-circle';
            if (type === 'danger') iconClass = 'fas fa-times-circle';
            
            alertDiv.innerHTML = `<i class="${iconClass}"></i> ${message}`;
            
            switch(type) {
                case 'success':
                    alertDiv.style.backgroundColor = 'var(--success-color)';
                    alertDiv.style.color = 'white';
                    break;
                case 'warning':
                    alertDiv.style.backgroundColor = 'var(--warning-color)';
                    alertDiv.style.color = 'var(--dark-color)';
                    break;
                case 'danger':
                    alertDiv.style.backgroundColor = 'var(--danger-color)';
                    alertDiv.style.color = 'white';
                    break;
                default:
                    alertDiv.style.backgroundColor = 'var(--info-color)';
                    alertDiv.style.color = 'white';
            }
            
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                alertDiv.style.opacity = '0';
                alertDiv.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    document.body.removeChild(alertDiv);
                }, 500);
            }, 3000);
        }

        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Achievement system
        let achievements = JSON.parse(localStorage.getItem('achievements')) || {
            firstConversion: false,
            fiveConversions: false,
            tenConversions: false,
            firstCopy: false,
            firstShare: false
        };

        function checkAchievements() {
            let newAchievement = false;

            // First conversion achievement
            if (stats.conversions >= 1 && !achievements.firstConversion) {
                achievements.firstConversion = true;
                showAlert("অভিনন্দন! আপনি প্রথম কনভার্সন সম্পন্ন করেছেন", "success");
                newAchievement = true;
            }

            // Five conversions achievement
            if (stats.conversions >= 5 && !achievements.fiveConversions) {
                achievements.fiveConversions = true;
                showAlert("অভিনন্দন! আপনি ৫টি কনভার্সন সম্পন্ন করেছেন", "success");
                newAchievement = true;
            }

            // First copy achievement
            if (stats.copies >= 1 && !achievements.firstCopy) {
                achievements.firstCopy = true;
                showAlert("অভিনন্দন! আপনি প্রথমবার তারিখ কপি করেছেন", "success");
                newAchievement = true;
            }

            // First share achievement
            if (stats.shares >= 1 && !achievements.firstShare) {
                achievements.firstShare = true;
                showAlert("অভিনন্দন! আপনি প্রথমবার তারিখ শেয়ার করেছেন", "success");
                newAchievement = true;
            }

            if (newAchievement) {
                localStorage.setItem('achievements', JSON.stringify(achievements));
                elements.achievementBadge.classList.add('pulse');
                setTimeout(() => {
                    elements.achievementBadge.classList.remove('pulse');
                }, 3000);
            }
        }

        // PWA installation prompt
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            // Show the install button
            elements.installPrompt.style.display = 'flex';
        });

        elements.installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            // Optionally, send analytics event with outcome of user choice
            console.log(`User response to the install prompt: ${outcome}`);
            // Hide the install button
            elements.installPrompt.style.display = 'none';
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
        });

        function dismissInstallPrompt() {
            elements.installPrompt.style.display = 'none';
        }

        // Set up event listeners
        elements.achievementBadge.addEventListener('click', () => {
            openModal('achievementModal');
        });

        document.getElementById('languageSwitch').addEventListener('click', () => {
            openModal('languageModal');
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        // Convert on page load with default value
        window.addEventListener('DOMContentLoaded', function() {
            // Initialize stats display
            elements.conversionCount.textContent = stats.conversions;
            elements.copiedCount.textContent = stats.copies;
            elements.sharedCount.textContent = stats.shares;
            
            // Update history display
            updateHistoryDisplay();
            
            // Convert the default date
            convertDate();
            
            // Check if this is the first visit
            if (!localStorage.getItem('firstVisit')) {
                setTimeout(() => {
                    showAlert("স্বাগতম! আপনার জন্ম তারিখ ইংরেজিতে কনভার্ট করতে এখানে লিখুন", "info");
                    localStorage.setItem('firstVisit', 'true');
                }, 1000);
            }
        });

        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful');
                }).catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement === elements.dateInput) {
                convertDate();
            }
        });