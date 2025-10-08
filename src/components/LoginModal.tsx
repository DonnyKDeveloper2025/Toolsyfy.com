import React, { useState, useEffect, useRef } from 'react';
import { ButtonSpinner } from './Spinner';

// Declare grecaptcha on Window interface to avoid global redeclaration errors.
declare global {
  interface Window {
    recaptchaVerifier: any;
    firebase: any;
    grecaptcha: any;
    confirmationResult: any;
  }
}

// --- Helper Data & Components ---

const countryCodes = [
    { "name": "United States", "dial_code": "+1", "code": "US", "flag": "🇺🇸" },
    { "name": "United Kingdom", "dial_code": "+44", "code": "GB", "flag": "🇬🇧" },
    { "name": "India", "dial_code": "+91", "code": "IN", "flag": "🇮🇳" },
    { "name": "Afghanistan", "dial_code": "+93", "code": "AF", "flag": "🇦🇫" },
    { "name": "Aland Islands", "dial_code": "+358", "code": "AX", "flag": "🇦🇽" },
    { "name": "Albania", "dial_code": "+355", "code": "AL", "flag": "🇦🇱" },
    { "name": "Algeria", "dial_code": "+213", "code": "DZ", "flag": "🇩🇿" },
    { "name": "American Samoa", "dial_code": "+1684", "code": "AS", "flag": "🇦🇸" },
    { "name": "Andorra", "dial_code": "+376", "code": "AD", "flag": "🇦🇩" },
    { "name": "Angola", "dial_code": "+244", "code": "AO", "flag": "🇦🇴" },
    { "name": "Anguilla", "dial_code": "+1264", "code": "AI", "flag": "🇦🇮" },
    { "name": "Antarctica", "dial_code": "+672", "code": "AQ", "flag": "🇦🇶" },
    { "name": "Antigua and Barbuda", "dial_code": "+1268", "code": "AG", "flag": "🇦🇬" },
    { "name": "Argentina", "dial_code": "+54", "code": "AR", "flag": "🇦🇷" },
    { "name": "Armenia", "dial_code": "+374", "code": "AM", "flag": "🇦🇲" },
    { "name": "Aruba", "dial_code": "+297", "code": "AW", "flag": "🇦🇼" },
    { "name": "Australia", "dial_code": "+61", "code": "AU", "flag": "🇦🇺" },
    { "name": "Austria", "dial_code": "+43", "code": "AT", "flag": "🇦🇹" },
    { "name": "Azerbaijan", "dial_code": "+994", "code": "AZ", "flag": "🇦🇿" },
    { "name": "Bahamas", "dial_code": "+1242", "code": "BS", "flag": "🇧🇸" },
    { "name": "Bahrain", "dial_code": "+973", "code": "BH", "flag": "🇧🇭" },
    { "name": "Bangladesh", "dial_code": "+880", "code": "BD", "flag": "🇧🇩" },
    { "name": "Barbados", "dial_code": "+1246", "code": "BB", "flag": "🇧🇧" },
    { "name": "Belarus", "dial_code": "+375", "code": "BY", "flag": "🇧🇾" },
    { "name": "Belgium", "dial_code": "+32", "code": "BE", "flag": "🇧🇪" },
    { "name": "Belize", "dial_code": "+501", "code": "BZ", "flag": "🇧🇿" },
    { "name": "Benin", "dial_code": "+229", "code": "BJ", "flag": "🇧🇯" },
    { "name": "Bermuda", "dial_code": "+1441", "code": "BM", "flag": "🇧🇲" },
    { "name": "Bhutan", "dial_code": "+975", "code": "BT", "flag": "🇧🇹" },
    { "name": "Bolivia", "dial_code": "+591", "code": "BO", "flag": "🇧🇴" },
    { "name": "Bosnia and Herzegovina", "dial_code": "+387", "code": "BA", "flag": "🇧🇦" },
    { "name": "Botswana", "dial_code": "+267", "code": "BW", "flag": "🇧🇼" },
    { "name": "Brazil", "dial_code": "+55", "code": "BR", "flag": "🇧🇷" },
    { "name": "British Indian Ocean Territory", "dial_code": "+246", "code": "IO", "flag": "🇮🇴" },
    { "name": "Brunei Darussalam", "dial_code": "+673", "code": "BN", "flag": "🇧🇳" },
    { "name": "Bulgaria", "dial_code": "+359", "code": "BG", "flag": "🇧🇬" },
    { "name": "Burkina Faso", "dial_code": "+226", "code": "BF", "flag": "🇧🇫" },
    { "name": "Burundi", "dial_code": "+257", "code": "BI", "flag": "🇧🇮" },
    { "name": "Cambodia", "dial_code": "+855", "code": "KH", "flag": "🇰🇭" },
    { "name": "Cameroon", "dial_code": "+237", "code": "CM", "flag": "🇨🇲" },
    { "name": "Canada", "dial_code": "+1", "code": "CA", "flag": "🇨🇦" },
    { "name": "Cape Verde", "dial_code": "+238", "code": "CV", "flag": "🇨🇻" },
    { "name": "Cayman Islands", "dial_code": "+345", "code": "KY", "flag": "🇰🇾" },
    { "name": "Central African Republic", "dial_code": "+236", "code": "CF", "flag": "🇨🇫" },
    { "name": "Chad", "dial_code": "+235", "code": "TD", "flag": "🇹🇩" },
    { "name": "Chile", "dial_code": "+56", "code": "CL", "flag": "🇨🇱" },
    { "name": "China", "dial_code": "+86", "code": "CN", "flag": "🇨🇳" },
    { "name": "Christmas Island", "dial_code": "+61", "code": "CX", "flag": "🇨🇽" },
    { "name": "Cocos (Keeling) Islands", "dial_code": "+61", "code": "CC", "flag": "🇨🇨" },
    { "name": "Colombia", "dial_code": "+57", "code": "CO", "flag": "🇨🇴" },
    { "name": "Comoros", "dial_code": "+269", "code": "KM", "flag": "🇰🇲" },
    { "name": "Congo", "dial_code": "+242", "code": "CG", "flag": "🇨🇬" },
    { "name": "Congo, The Democratic Republic of the", "dial_code": "+243", "code": "CD", "flag": "🇨🇩" },
    { "name": "Cook Islands", "dial_code": "+682", "code": "CK", "flag": "🇨🇰" },
    { "name": "Costa Rica", "dial_code": "+506", "code": "CR", "flag": "🇨🇷" },
    { "name": "Cote d'Ivoire", "dial_code": "+225", "code": "CI", "flag": "🇨🇮" },
    { "name": "Croatia", "dial_code": "+385", "code": "HR", "flag": "🇭🇷" },
    { "name": "Cuba", "dial_code": "+53", "code": "CU", "flag": "🇨🇺" },
    { "name": "Cyprus", "dial_code": "+357", "code": "CY", "flag": "🇨🇾" },
    { "name": "Czech Republic", "dial_code": "+420", "code": "CZ", "flag": "🇨🇿" },
    { "name": "Denmark", "dial_code": "+45", "code": "DK", "flag": "🇩🇰" },
    { "name": "Djibouti", "dial_code": "+253", "code": "DJ", "flag": "🇩🇯" },
    { "name": "Dominica", "dial_code": "+1767", "code": "DM", "flag": "🇩🇲" },
    { "name": "Dominican Republic", "dial_code": "+1849", "code": "DO", "flag": "🇩🇴" },
    { "name": "Ecuador", "dial_code": "+593", "code": "EC", "flag": "🇪🇨" },
    { "name": "Egypt", "dial_code": "+20", "code": "EG", "flag": "🇪🇬" },
    { "name": "El Salvador", "dial_code": "+503", "code": "SV", "flag": "🇸🇻" },
    { "name": "Equatorial Guinea", "dial_code": "+240", "code": "GQ", "flag": "🇬🇶" },
    { "name": "Eritrea", "dial_code": "+291", "code": "ER", "flag": "🇪🇷" },
    { "name": "Estonia", "dial_code": "+372", "code": "EE", "flag": "🇪🇪" },
    { "name": "Ethiopia", "dial_code": "+251", "code": "ET", "flag": "🇪🇹" },
    { "name": "Falkland Islands (Malvinas)", "dial_code": "+500", "code": "FK", "flag": "🇫🇰" },
    { "name": "Faroe Islands", "dial_code": "+298", "code": "FO", "flag": "🇫🇴" },
    { "name": "Fiji", "dial_code": "+679", "code": "FJ", "flag": "🇫🇯" },
    { "name": "Finland", "dial_code": "+358", "code": "FI", "flag": "🇫🇮" },
    { "name": "France", "dial_code": "+33", "code": "FR", "flag": "🇫🇷" },
    { "name": "French Guiana", "dial_code": "+594", "code": "GF", "flag": "🇬🇫" },
    { "name": "French Polynesia", "dial_code": "+689", "code": "PF", "flag": "🇵🇫" },
    { "name": "Gabon", "dial_code": "+241", "code": "GA", "flag": "🇬🇦" },
    { "name": "Gambia", "dial_code": "+220", "code": "GM", "flag": "🇬🇲" },
    { "name": "Georgia", "dial_code": "+995", "code": "GE", "flag": "🇬🇪" },
    { "name": "Germany", "dial_code": "+49", "code": "DE", "flag": "🇩🇪" },
    { "name": "Ghana", "dial_code": "+233", "code": "GH", "flag": "🇬🇭" },
    { "name": "Gibraltar", "dial_code": "+350", "code": "GI", "flag": "🇬🇮" },
    { "name": "Greece", "dial_code": "+30", "code": "GR", "flag": "🇬🇷" },
    { "name": "Greenland", "dial_code": "+299", "code": "GL", "flag": "🇬🇱" },
    { "name": "Grenada", "dial_code": "+1473", "code": "GD", "flag": "🇬🇩" },
    { "name": "Guadeloupe", "dial_code": "+590", "code": "GP", "flag": "🇬🇵" },
    { "name": "Guam", "dial_code": "+1671", "code": "GU", "flag": "🇬🇺" },
    { "name": "Guatemala", "dial_code": "+502", "code": "GT", "flag": "🇬🇹" },
    { "name": "Guernsey", "dial_code": "+44", "code": "GG", "flag": "🇬🇬" },
    { "name": "Guinea", "dial_code": "+224", "code": "GN", "flag": "🇬🇳" },
    { "name": "Guinea-Bissau", "dial_code": "+245", "code": "GW", "flag": "🇬🇼" },
    { "name": "Guyana", "dial_code": "+592", "code": "GY", "flag": "🇬🇾" },
    { "name": "Haiti", "dial_code": "+509", "code": "HT", "flag": "🇭🇹" },
    { "name": "Honduras", "dial_code": "+504", "code": "HN", "flag": "🇭🇳" },
    { "name": "Hong Kong", "dial_code": "+852", "code": "HK", "flag": "🇭🇰" },
    { "name": "Hungary", "dial_code": "+36", "code": "HU", "flag": "🇭🇺" },
    { "name": "Iceland", "dial_code": "+354", "code": "IS", "flag": "🇮🇸" },
    { "name": "Indonesia", "dial_code": "+62", "code": "ID", "flag": "🇮🇩" },
    { "name": "Iran", "dial_code": "+98", "code": "IR", "flag": "🇮🇷" },
    { "name": "Iraq", "dial_code": "+964", "code": "IQ", "flag": "🇮🇶" },
    { "name": "Ireland", "dial_code": "+353", "code": "IE", "flag": "🇮🇪" },
    { "name": "Isle of Man", "dial_code": "+44", "code": "IM", "flag": "🇮🇲" },
    { "name": "Israel", "dial_code": "+972", "code": "IL", "flag": "🇮🇱" },
    { "name": "Italy", "dial_code": "+39", "code": "IT", "flag": "🇮🇹" },
    { "name": "Jamaica", "dial_code": "+1876", "code": "JM", "flag": "🇯🇲" },
    { "name": "Japan", "dial_code": "+81", "code": "JP", "flag": "🇯🇵" },
    { "name": "Jersey", "dial_code": "+44", "code": "JE", "flag": "🇯🇪" },
    { "name": "Jordan", "dial_code": "+962", "code": "JO", "flag": "🇯🇴" },
    { "name": "Kazakhstan", "dial_code": "+7", "code": "KZ", "flag": "🇰🇿" },
    { "name": "Kenya", "dial_code": "+254", "code": "KE", "flag": "🇰🇪" },
    { "name": "Kiribati", "dial_code": "+686", "code": "KI", "flag": "🇰🇮" },
    { "name": "Korea, Democratic People's Republic of", "dial_code": "+850", "code": "KP", "flag": "🇰🇵" },
    { "name": "Korea, Republic of", "dial_code": "+82", "code": "KR", "flag": "🇰🇷" },
    { "name": "Kuwait", "dial_code": "+965", "code": "KW", "flag": "🇰🇼" },
    { "name": "Kyrgyzstan", "dial_code": "+996", "code": "KG", "flag": "🇰🇬" },
    { "name": "Lao People's Democratic Republic", "dial_code": "+856", "code": "LA", "flag": "🇱🇦" },
    { "name": "Latvia", "dial_code": "+371", "code": "LV", "flag": "🇱🇻" },
    { "name": "Lebanon", "dial_code": "+961", "code": "LB", "flag": "🇱🇧" },
    { "name": "Lesotho", "dial_code": "+266", "code": "LS", "flag": "🇱🇸" },
    { "name": "Liberia", "dial_code": "+231", "code": "LR", "flag": "🇱🇷" },
    { "name": "Libyan Arab Jamahiriya", "dial_code": "+218", "code": "LY", "flag": "🇱🇾" },
    { "name": "Liechtenstein", "dial_code": "+423", "code": "LI", "flag": "🇱🇮" },
    { "name": "Lithuania", "dial_code": "+370", "code": "LT", "flag": "🇱🇹" },
    { "name": "Luxembourg", "dial_code": "+352", "code": "LU", "flag": "🇱🇺" },
    { "name": "Macao", "dial_code": "+853", "code": "MO", "flag": "🇲🇴" },
    { "name": "Macedonia", "dial_code": "+389", "code": "MK", "flag": "🇲🇰" },
    { "name": "Madagascar", "dial_code": "+261", "code": "MG", "flag": "🇲🇬" },
    { "name": "Malawi", "dial_code": "+265", "code": "MW", "flag": "🇲🇼" },
    { "name": "Malaysia", "dial_code": "+60", "code": "MY", "flag": "🇲🇾" },
    { "name": "Maldives", "dial_code": "+960", "code": "MV", "flag": "🇲🇻" },
    { "name": "Mali", "dial_code": "+223", "code": "ML", "flag": "🇲🇱" },
    { "name": "Malta", "dial_code": "+356", "code": "MT", "flag": "🇲🇹" },
    { "name": "Marshall Islands", "dial_code": "+692", "code": "MH", "flag": "🇲🇭" },
    { "name": "Martinique", "dial_code": "+596", "code": "MQ", "flag": "🇲🇶" },
    { "name": "Mauritania", "dial_code": "+222", "code": "MR", "flag": "🇲🇷" },
    { "name": "Mauritius", "dial_code": "+230", "code": "MU", "flag": "🇲🇺" },
    { "name": "Mayotte", "dial_code": "+262", "code": "YT", "flag": "🇾🇹" },
    { "name": "Mexico", "dial_code": "+52", "code": "MX", "flag": "🇲🇽" },
    { "name": "Micronesia, Federated States of", "dial_code": "+691", "code": "FM", "flag": "🇫🇲" },
    { "name": "Moldova, Republic of", "dial_code": "+373", "code": "MD", "flag": "🇲🇩" },
    { "name": "Monaco", "dial_code": "+377", "code": "MC", "flag": "🇲🇨" },
    { "name": "Mongolia", "dial_code": "+976", "code": "MN", "flag": "🇲🇳" },
    { "name": "Montenegro", "dial_code": "+382", "code": "ME", "flag": "🇲🇪" },
    { "name": "Montserrat", "dial_code": "+1664", "code": "MS", "flag": "🇲🇸" },
    { "name": "Morocco", "dial_code": "+212", "code": "MA", "flag": "🇲🇦" },
    { "name": "Mozambique", "dial_code": "+258", "code": "MZ", "flag": "🇲🇿" },
    { "name": "Myanmar", "dial_code": "+95", "code": "MM", "flag": "🇲🇲" },
    { "name": "Namibia", "dial_code": "+264", "code": "NA", "flag": "🇳🇦" },
    { "name": "Nauru", "dial_code": "+674", "code": "NR", "flag": "🇳🇷" },
    { "name": "Nepal", "dial_code": "+977", "code": "NP", "flag": "🇳🇵" },
    { "name": "Netherlands", "dial_code": "+31", "code": "NL", "flag": "🇳🇱" },
    { "name": "Netherlands Antilles", "dial_code": "+599", "code": "AN", "flag": "🇳🇱" },
    { "name": "New Caledonia", "dial_code": "+687", "code": "NC", "flag": "🇳🇨" },
    { "name": "New Zealand", "dial_code": "+64", "code": "NZ", "flag": "🇳🇿" },
    { "name": "Nicaragua", "dial_code": "+505", "code": "NI", "flag": "🇳🇮" },
    { "name": "Niger", "dial_code": "+227", "code": "NE", "flag": "🇳🇪" },
    { "name": "Nigeria", "dial_code": "+234", "code": "NG", "flag": "🇳🇬" },
    { "name": "Niue", "dial_code": "+683", "code": "NU", "flag": "🇳🇺" },
    { "name": "Norfolk Island", "dial_code": "+672", "code": "NF", "flag": "🇳🇫" },
    { "name": "Northern Mariana Islands", "dial_code": "+1670", "code": "MP", "flag": "🇲🇵" },
    { "name": "Norway", "dial_code": "+47", "code": "NO", "flag": "🇳🇴" },
    { "name": "Oman", "dial_code": "+968", "code": "OM", "flag": "🇴🇲" },
    { "name": "Pakistan", "dial_code": "+92", "code": "PK", "flag": "🇵🇰" },
    { "name": "Palau", "dial_code": "+680", "code": "PW", "flag": "🇵🇼" },
    { "name": "Palestinian Territory, Occupied", "dial_code": "+970", "code": "PS", "flag": "🇵🇸" },
    { "name": "Panama", "dial_code": "+507", "code": "PA", "flag": "🇵🇦" },
    { "name": "Papua New Guinea", "dial_code": "+675", "code": "PG", "flag": "🇵🇬" },
    { "name": "Paraguay", "dial_code": "+595", "code": "PY", "flag": "🇵🇾" },
    { "name": "Peru", "dial_code": "+51", "code": "PE", "flag": "🇵🇪" },
    { "name": "Philippines", "dial_code": "+63", "code": "PH", "flag": "🇵🇭" },
    { "name": "Pitcairn", "dial_code": "+872", "code": "PN", "flag": "🇵🇳" },
    { "name": "Poland", "dial_code": "+48", "code": "PL", "flag": "🇵🇱" },
    { "name": "Portugal", "dial_code": "+351", "code": "PT", "flag": "🇵🇹" },
    { "name": "Puerto Rico", "dial_code": "+1939", "code": "PR", "flag": "🇵🇷" },
    { "name": "Qatar", "dial_code": "+974", "code": "QA", "flag": "🇶🇦" },
    { "name": "Romania", "dial_code": "+40", "code": "RO", "flag": "🇷🇴" },
    { "name": "Russia", "dial_code": "+7", "code": "RU", "flag": "🇷🇺" },
    { "name": "Rwanda", "dial_code": "+250", "code": "RW", "flag": "🇷🇼" },
    { "name": "Reunion", "dial_code": "+262", "code": "RE", "flag": "🇷🇪" },
    { "name": "Saint Barthelemy", "dial_code": "+590", "code": "BL", "flag": "🇧🇱" },
    { "name": "Saint Helena", "dial_code": "+290", "code": "SH", "flag": "🇸🇭" },
    { "name": "Saint Kitts and Nevis", "dial_code": "+1869", "code": "KN", "flag": "🇰🇳" },
    { "name": "Saint Lucia", "dial_code": "+1758", "code": "LC", "flag": "🇱🇨" },
    { "name": "Saint Martin", "dial_code": "+590", "code": "MF", "flag": "🇲🇫" },
    { "name": "Saint Pierre and Miquelon", "dial_code": "+508", "code": "PM", "flag": "🇵🇲" },
    { "name": "Saint Vincent and the Grenadines", "dial_code": "+1784", "code": "VC", "flag": "🇻🇨" },
    { "name": "Samoa", "dial_code": "+685", "code": "WS", "flag": "🇼🇸" },
    { "name": "San Marino", "dial_code": "+378", "code": "SM", "flag": "🇸🇲" },
    { "name": "Sao Tome and Principe", "dial_code": "+239", "code": "ST", "flag": "🇸🇹" },
    { "name": "Saudi Arabia", "dial_code": "+966", "code": "SA", "flag": "🇸🇦" },
    { "name": "Senegal", "dial_code": "+221", "code": "SN", "flag": "🇸🇳" },
    { "name": "Serbia", "dial_code": "+381", "code": "RS", "flag": "🇷🇸" },
    { "name": "Seychelles", "dial_code": "+248", "code": "SC", "flag": "🇸🇨" },
    { "name": "Sierra Leone", "dial_code": "+232", "code": "SL", "flag": "🇸🇱" },
    { "name": "Singapore", "dial_code": "+65", "code": "SG", "flag": "🇸🇬" },
    { "name": "Slovakia", "dial_code": "+421", "code": "SK", "flag": "🇸🇰" },
    { "name": "Slovenia", "dial_code": "+386", "code": "SI", "flag": "🇸🇮" },
    { "name": "Solomon Islands", "dial_code": "+677", "code": "SB", "flag": "🇸🇧" },
    { "name": "Somalia", "dial_code": "+252", "code": "SO", "flag": "🇸🇴" },
    { "name": "South Africa", "dial_code": "+27", "code": "ZA", "flag": "🇿🇦" },
    { "name": "South Georgia and the South Sandwich Islands", "dial_code": "+500", "code": "GS", "flag": "🇬🇸" },
    { "name": "Spain", "dial_code": "+34", "code": "ES", "flag": "🇪🇸" },
    { "name": "Sri Lanka", "dial_code": "+94", "code": "LK", "flag": "🇱🇰" },
    { "name": "Sudan", "dial_code": "+249", "code": "SD", "flag": "🇸🇩" },
    { "name": "Suriname", "dial_code": "+597", "code": "SR", "flag": "🇸🇷" },
    { "name": "Svalbard and Jan Mayen", "dial_code": "+47", "code": "SJ", "flag": "🇸🇯" },
    { "name": "Swaziland", "dial_code": "+268", "code": "SZ", "flag": "🇸🇿" },
    { "name": "Sweden", "dial_code": "+46", "code": "SE", "flag": "🇸🇪" },
    { "name": "Switzerland", "dial_code": "+41", "code": "CH", "flag": "🇨🇭" },
    { "name": "Syrian Arab Republic", "dial_code": "+963", "code": "SY", "flag": "🇸🇾" },
    { "name": "Taiwan", "dial_code": "+886", "code": "TW", "flag": "🇹🇼" },
    { "name": "Tajikistan", "dial_code": "+992", "code": "TJ", "flag": "🇹🇯" },
    { "name": "Tanzania, United Republic of", "dial_code": "+255", "code": "TZ", "flag": "🇹🇿" },
    { "name": "Thailand", "dial_code": "+66", "code": "TH", "flag": "🇹🇭" },
    { "name": "Timor-Leste", "dial_code": "+670", "code": "TL", "flag": "🇹🇱" },
    { "name": "Togo", "dial_code": "+228", "code": "TG", "flag": "🇹🇬" },
    { "name": "Tokelau", "dial_code": "+690", "code": "TK", "flag": "🇹🇰" },
    { "name": "Tonga", "dial_code": "+676", "code": "TO", "flag": "🇹🇴" },
    { "name": "Trinidad and Tobago", "dial_code": "+1868", "code": "TT", "flag": "🇹🇹" },
    { "name": "Tunisia", "dial_code": "+216", "code": "TN", "flag": "🇹🇳" },
    { "name": "Turkey", "dial_code": "+90", "code": "TR", "flag": "🇹🇷" },
    { "name": "Turkmenistan", "dial_code": "+993", "code": "TM", "flag": "🇹🇲" },
    { "name": "Turks and Caicos Islands", "dial_code": "+1649", "code": "TC", "flag": "🇹🇨" },
    { "name": "Tuvalu", "dial_code": "+688", "code": "TV", "flag": "🇹🇻" },
    { "name": "Uganda", "dial_code": "+256", "code": "UG", "flag": "🇺🇬" },
    { "name": "Ukraine", "dial_code": "+380", "code": "UA", "flag": "🇺🇦" },
    { "name": "United Arab Emirates", "dial_code": "+971", "code": "AE", "flag": "🇦🇪" },
    { "name": "Uruguay", "dial_code": "+598", "code": "UY", "flag": "🇺🇾" },
    { "name": "Uzbekistan", "dial_code": "+998", "code": "UZ", "flag": "🇺🇿" },
    { "name": "Vanuatu", "dial_code": "+678", "code": "VU", "flag": "🇻🇺" },
    { "name": "Venezuela", "dial_code": "+58", "code": "VE", "flag": "🇻🇪" },
    { "name": "Vietnam", "dial_code": "+84", "code": "VN", "flag": "🇻🇳" },
    { "name": "Virgin Islands, British", "dial_code": "+1284", "code": "VG", "flag": "🇻🇬" },
    { "name": "Virgin Islands, U.S.", "dial_code": "+1340", "code": "VI", "flag": "🇻🇮" },
    { "name": "Wallis and Futuna", "dial_code": "+681", "code": "WF", "flag": "🇼🇫" },
    { "name": "Yemen", "dial_code": "+967", "code": "YE", "flag": "🇾🇪" },
    { "name": "Zambia", "dial_code": "+260", "code": "ZM", "flag": "🇿🇲" },
    { "name": "Zimbabwe", "dial_code": "+263", "code": "ZW", "flag": "🇿🇼" }
];

const SocialLoginButton: React.FC<{ provider: 'Google' | 'GitHub'; onClick: () => void; }> = ({ provider, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-border rounded-md hover:bg-secondary transition-colors">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            {provider === 'Google' && <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" />}
            {provider === 'GitHub' && <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.3-.6-1.5.1-3.1 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.8.1 3.1.8.8 1.3 1.9 1.3 3.1 0 4.7-2.8 5.7-5.5 6 .4.3.8 1 .8 2v2.9c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />}
        </svg>
        <span>Sign in with {provider}</span>
    </button>
);

interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.keyCode === 27) handleClose(); };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, []);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => { /* reCAPTCHA solved */ },
                'expired-callback': () => { window.recaptchaVerifier.render().then((widgetId: any) => { window.grecaptcha.reset(widgetId); }); }
            });
        }
    };

    useEffect(() => {
        if (authMethod === 'phone') {
            // Delay rendering to ensure the container is in the DOM
            setTimeout(setupRecaptcha, 100);
        }
    }, [authMethod]);
    
    const handleSocialLogin = (providerType: 'google' | 'github') => {
        const provider = providerType === 'google' 
            ? new window.firebase.auth.GoogleAuthProvider() 
            : new window.firebase.auth.GithubAuthProvider();
        
        setIsLoading(true);
        setError('');
        window.firebase.auth().signInWithPopup(provider)
            .then(() => handleClose())
            .catch((err: any) => setError(err.message))
            .finally(() => setIsLoading(false));
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const auth = window.firebase.auth();
        const action = isSignUp 
            ? auth.createUserWithEmailAndPassword(email, password) 
            : auth.signInWithEmailAndPassword(email, password);

        action
            .then(() => handleClose())
            .catch((err: any) => setError(err.message))
            .finally(() => setIsLoading(false));
    };

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const fullPhoneNumber = countryCode + phone;
        const appVerifier = window.recaptchaVerifier;

        window.firebase.auth().signInWithPhoneNumber(fullPhoneNumber, appVerifier)
            .then((confirmationResult: any) => {
                window.confirmationResult = confirmationResult;
                setOtpSent(true);
                setError('');
            })
            .catch((err: any) => {
                setError(err.message);
                window.recaptchaVerifier.render().then((widgetId: any) => {
                    window.grecaptcha.reset(widgetId);
                });
            })
            .finally(() => setIsLoading(false));
    };
    
    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        window.confirmationResult.confirm(otp)
            .then(() => handleClose())
            .catch((err: any) => setError(err.message))
            .finally(() => setIsLoading(false));
    };
    
    const animationClass = isClosing ? 'opacity-0' : 'opacity-100';
    const modalAnimationClass = isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100';

    return (
        <div className={`fixed inset-0 modal-overlay z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${animationClass}`} onClick={handleClose}>
            <div className={`bg-card rounded-2xl shadow-2xl w-full max-w-md flex flex-col transition-all duration-300 ${modalAnimationClass}`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">Sign In / Sign Up</h2>
                    <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary transition-colors"><i data-lucide="x" className="h-6 w-6"></i></button>
                </div>

                <div className="p-6">
                    <div className="space-y-4 mb-6">
                        <SocialLoginButton provider="Google" onClick={() => handleSocialLogin('google')} />
                        <SocialLoginButton provider="GitHub" onClick={() => handleSocialLogin('github')} />
                    </div>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-border" />
                        <span className="mx-4 text-xs font-semibold text-muted">OR</span>
                        <hr className="flex-grow border-border" />
                    </div>
                    
                    <div className="flex border-b border-border mb-4">
                        <button onClick={() => setAuthMethod('email')} className={`w-1/2 py-2 text-sm font-semibold transition-colors ${authMethod === 'email' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-muted hover:text-foreground'}`}>Email</button>
                        <button onClick={() => setAuthMethod('phone')} className={`w-1/2 py-2 text-sm font-semibold transition-colors ${authMethod === 'phone' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-muted hover:text-foreground'}`}>Phone</button>
                    </div>

                    {authMethod === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-muted mb-1" htmlFor="email">Email Address</label>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 bg-card border border-border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1" htmlFor="password">Password</label>
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full p-2 bg-card border border-border rounded-md" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary disabled:opacity-50">
                                {isLoading ? <ButtonSpinner /> : isSignUp ? 'Create Account' : 'Sign In'}
                            </button>
                            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-sm text-center text-muted hover:text-brand-primary">
                                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </button>
                        </form>
                    )}
                    
                    {authMethod === 'phone' && (
                        <>
                            {!otpSent ? (
                                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                    <div className="flex">
                                        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="p-2 bg-card border border-r-0 border-border rounded-l-md appearance-none text-sm">
                                            {countryCodes.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                                        </select>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} required placeholder="Phone number" className="w-full p-2 bg-card border border-border rounded-r-md"/>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary disabled:opacity-50">
                                        {isLoading ? <ButtonSpinner /> : 'Send Verification Code'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleOtpSubmit} className="space-y-4">
                                    <p className="text-sm text-muted text-center">Enter the 6-digit code sent to {countryCode}{phone}.</p>
                                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} placeholder="123456" className="w-full p-2 text-center tracking-[0.5em] bg-card border border-border rounded-md"/>
                                    <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary disabled:opacity-50">
                                        {isLoading ? <ButtonSpinner /> : 'Verify & Sign In'}
                                    </button>
                                    <button type="button" onClick={() => {setOtpSent(false); setError('')}} className="w-full text-sm text-center text-muted hover:text-brand-primary">
                                        Change phone number
                                    </button>
                                </form>
                            )}
                            <div id="recaptcha-container" className="mt-4"></div>
                        </>
                    )}
                    
                    {error && <p className="mt-4 text-sm text-center text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}
                </div>
            </div>
        </div>
    );
};

// FIX: Changed to a default export for compatibility with React.lazy.
export default LoginModal;