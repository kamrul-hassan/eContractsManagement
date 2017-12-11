//==============================================================================
// _locale.js
// Translations
//------------------------------------------------------------------------------

var _locale = {};

_locale =
{
	"application_title":
	{
		"_desc": "Global - Application title",
		"en": "Blédina | eContracts Management",
		"fr": "Blédina | Dématérialisation des Contrats Pharmacie"
	},
	"cancel_button_label":
	{
		"_desc": "Global - Cancel button label",
		"en": "Cancel",
		"fr": "Annuler"
	},
	"next_button_label":
	{
		"_desc": "Global - Next button label",
		"en": "Next >>",
		"fr": "Suivant >>"
	},
	"previous_button_label":
	{
		"_desc": "Global - Previous button label",
		"en": "<< Previous",
		"fr": "<< Précédent"
	},
	"validate_button_label":
	{
		"_desc": "Global - Validate button label",
		"en": "Validate",
		"fr": "Valider"
	},
	"close_button_label":
	{
		"_desc": "Global - Close button label",
		"en": "Close",
		"fr": "Fermer"
	},
	"clear_button_label":
	{
		"_desc": "Screen 3 - Clear button label",
		"en": "Clear",
		"fr": "Effacer"
	},
	"preview_button_label":
	{
		"_desc": "Screen 3 - Preview button label",
		"en": "Preview",
		"fr": "Aperçu"
	},
	"screen_1_instructions":
	{
		"_desc": "Screen 1 instructions",
		"en": "Select a formulary",
		"fr": "Sélectionnez un contrat"
	},
	"screen_2_instructions":
	{
		"_desc": "Screen 2 instructions",
		"en": "Fill attributes",
		"fr": "Entrez les informations"
	},
	"screen_3_instructions":
	{
		"_desc": "Screen 3 instructions",
		"en": "Review, sign and validate",
		"fr": "Relecture, signature et validation"
	},
	"doclist_col_name_label":
	{
		"_desc": "Screen 1 - Documents list - Name column",
		"en": "Name",
		"fr": "Nom"
	},
	"doclist_col_version_label":
	{
		"_desc": "Screen 1 - Documents list - Version column",
		"en": "Version number",
		"fr": "Révision"
	},
	"doclist_col_publish_label":
	{
		"_desc": "Screen 1 - Documents list - Publish date column",
		"en": "Publish date",
		"fr": "Date de publication"
	},
	"doclist_col_signed_label":
	{
		"_desc": "Screen 1 - Documents list - Signed date column",
		"en": "Sign date",
		"fr": "Date de signature"
	},
	"placeholder_label":
	{
		"_desc": "Screen 2 - Placeholder stub",
		"en": "Enter",
		"fr": "Entrez "
	},
	"validation_error_header":
	{
		"_desc": "Header of the validation error dialog",
		"en": "Validation error message",
		"fr": "Validation"
	},
	"validation_error_message":
	{
		"_desc": "Message of the validation error",
		"en": "%1 required",
		"fr": "%1 est obligatoire"
	},
	"no_data_found_message":
	{
		"_desc": "Message of the No data found",
		"en": "No data found",
		"fr": "Aucune donnée disponible"
	},
	"data_save_message":
	{
		"_desc": "Message of the data saved successfully",
		"en": "Data saved successfully",
		"fr": "Données enregistrées avec succès"
	},
	"error_on_page":
	{
		"_desc": "Message of the error on the page",
		"en": "There was an error on this page. Error description: ",
		"fr": "Il y avait une erreur sur cette page. Description: "
	},
	"email_address_validation_message":
	{
		"_desc": "Message of the email address validation",
		"en": " is not a valid email address",
		"fr": " n'est pas une adresse e-mail valide"
	},
	"error_description_message":
	{
		"_desc": "Label of the Error description",
		"en": "Error description: ",
		"fr": "Description de l'erreur: "
	},
	"required_text_message":
	{
		"_desc": "Label of the required",
		"en": " is required",
		"fr": " est requis(e)"
	},
	"date_validation_message":
	{
		"_desc": "Validation message of the date",
		"en": " is not a valid date",
		"fr": " n'est pas une date valide"
	}
}
////////////////////////////////////////////////////////////////////////////////
function _X(msg) { return _locale[msg] ? (_locale[msg][_parameters.Locale] || _locale[msg]['en']) : '?['+msg+']?'; }

////////////////////////////////////////////////////////////////////////////////
function _Xall() { $.each(_locale, function(key, value) { $('#'+key).text(_X(key)); }); };


//==============================================================================
// EOS