//==============================================================================
// app.js
// Purpose: Main application script
//------------------------------------------------------------------------------

var App = function ()
{
	var pub = this;
	var pri = {};
	var documents;
	var documentsFile;
	var customerFields;
	var customerName;
	var pharName;
	var cust_ExternalID;
	var cust_ADD;
	var customer_address;
	var repEmail;
	var rep_email;
	var cipcode;
	var cip_code;
	pri.isRenderHtml = false;
	pri.selectedFormulary = '';
	pri.imageData = '';
	pri.viewport = null;
	pri.formData = '';
	pub.currentPage = 1;
	pri.hasSignature = false;
	pri.isRegisterSignaturePad = false;
	pri.saveData = [];
	pri.attachment_type = '';

	pri.termsCheckBox =
	{
		FIELD_NAME: 'isAgreeTerms',
		FIELD_LABEL: 'J’accepte que mon adresse e-mail soit utilisée pour m’envoyer le présent contrat',
		DATA_TYPE: 'B'
	};
	pub.isSaveSuccessfully = false;

	//------------------------------------------------------------------------------
	pub.loadFormulary = function ()
	{
		$('.overlay').show();
		//Get data from database
		executeScript("loadDocuments", pri.renderFormulary, null);
		//pri.renderFormulary(JSON.stringify(Constant.formularyList));
	};
	//------------------------------------------------------------------------------
	pri.renderFormulary = function (data)
	{
		$('.overlay').hide();
		if (data && data.documents && data.documents.length != 0)
		{
			documents = data.documents;
			$('#formulary-table .table-row').remove();
			var div = $('#formulary-table');
			var html = '';
			$.each(documents, function (index, value)
			{
				html += '<div class="table-row" data-value=' + value.REF_ID + '>' +
				'<div class="table-cell">' + value.DOCUMENT_NAME + '</div>' +
				'<div class="table-cell hide">' + value.VERSION + '</div>' +
				'<div class="table-cell hide">' + value.PUBLISH_DATE + '</div>' +
				'<div class="table-cell">' + value.LAST_SIGNED_DATE + '</div>' +
				'</div>';
			}
			);
			div.append(html);
		}
		else
		{
			pri.notifyUser('alert', _X('no_data_found_message'));
		}
	}
	//------------------------------------------------------------------------------
	pri.notifyUser = function (type, message)
	{
		$('.overlay').hide();
		$('#notifyBox').empty();
		if (type == 'alert')
		{
			$('#notifyBox').html('<div class="alert alert-danger" role="alert">' + message + '</div>');
			$("#notifyContainer").show().delay(5000).fadeOut();
		}
		else if (type == "warning")
		{
			$('#notifyBox').html('<div class="alert alert-warning" role="alert">' + message + '</div>');
			$("#notifyContainer").show().delay(5000).fadeOut();
		}
		else if (type == "success")
		{
			$('#notifyBox').html('<div class="alert alert-success" role="alert">' + message + '</div>');
			$("#notifyContainer").show().delay(5000).fadeOut();
		}
		else
		{
			$('#notifyBox').html('<div class="alert alert-danger" role="alert">' + message + '</div>');
			$("#notifyContainer").show().delay(5000).fadeOut();

		}

	}
	//------------------------------------------------------------------------------
	pub.previousPage = function ()
	{
		$("#previous-view").removeClass('hide');
		if (pub.currentPage == 2)
		{
			pub.currentPage = 1;
			$('.page.hide').removeClass('hide');
			$('#fill-attributes-section').addClass('hide');
			$('#review-section').removeClass('hide').addClass('hide');
			$("#previous-view").removeClass('hide').addClass('hide');
			$('#validate-form').removeClass('hide').addClass('hide');
		}
		else if (pub.currentPage == 3)
		{
			pub.currentPage = 2;
			$('.page.hide').removeClass('hide');
			$('#select-formulary-section').addClass('hide');
			$('#review-section').addClass('hide');
			$("#next-view").removeClass('hide');
			$('#validate-form').removeClass('hide').addClass('hide');
		}
	}
	//------------------------------------------------------------------------------
	pub.nextPage = function ()
	{
		if (pub.currentPage == 1)
		{
			pub.currentPage = 2;
			$('.page.hide').removeClass('hide');
			$('#select-formulary-section').removeClass('hide').addClass('hide');
			$('#review-section').addClass('hide');
			$("#previous-view").removeClass('hide');
			$('#validate-form').removeClass('hide').addClass('hide');
			if (!pri.isRenderHtml)
			{
				pri.generateHtmlForm();
			}
			pri.isRenderHtml = true;
		}
		else if (pub.currentPage == 2)
		{
			_echo('validating fields');
			var isValid = pri.validateAttributes();
			if (isValid)
			{
				pub.currentPage = 3;
				$('.page.hide').removeClass('hide');
				$('#select-formulary-section').addClass('hide');
				$('#fill-attributes-section').addClass('hide');
				$("#previous-view").removeClass('hide');
				$('#validate-form').removeClass('hide');
				$("#next-view").removeClass('hide').addClass('hide');
				pri.writeInPdf(false);
				if (!pri.isRegisterSignaturePad && pri.hasSignature)
				{
					pri.isRegisterSignaturePad = true;
					pri.registerSignaturePad();
				}
			}
			else
			{
				$('#validation-modal').modal('show');
			}
		}
	};
	//------------------------------------------------------------------------------
	pub.save = function ()
	{
		pri.saveData = [];

		var isValid = pri.validate();
		if (isValid)
		{

			var base64Data = pri.writeInPdf(true);
			pri.saveData.push(
			{
				'FIELD_NAME': 'PdfFileID',
				'FIELD_VALUE': pri.selectedFormulary,
				'FIELD_DATATYPE': 'ID'
			}
			); // This should be always first.
			pri.saveData.push(
			{
				'FIELD_NAME': 'finalPdfFile',
				'FIELD_VALUE': base64Data,
				'FIELD_DATATYPE': 'base64'
			}
			);
			pri.saveData.push(
			{
				'FIELD_NAME': pri.termsCheckBox.FIELD_NAME,
				'FIELD_VALUE': $('#' + pri.termsCheckBox.FIELD_NAME).is(':checked'),
				'FIELD_DATATYPE': pri.termsCheckBox.DATA_TYPE
			}
			);
			$.each(pri.formData, function (index, item)
			{
				// FxM | 2018-12-08 | Except signatures, all defined fields are worth saving; especially the hidden ones ;)
				//if (item.IS_VISIBLE === '1')
				if (true)
				{
					if (item.DATA_TYPE == 'B')
					{
						pri.saveData.push(
						{
							'FIELD_NAME': item.FIELD_NAME,
							'FIELD_VALUE': $('#' + item.FIELD_NAME).is(':checked'),
							'FIELD_DATATYPE': item.DATA_TYPE
						}
						);
					}
					else if (item.DATA_TYPE != 'S')
					{
						pri.saveData.push(
						{
							'FIELD_NAME': item.FIELD_NAME,
							'FIELD_VALUE': $('#' + item.FIELD_NAME).val(),
							'FIELD_DATATYPE': item.DATA_TYPE
						}
						);
					}
				}
				else
				{
					pri.saveData.push(
					{
						'FIELD_NAME': item.FIELD_NAME,
						'FIELD_VALUE': item.FIELD_INIT,
						'FIELD_DATATYPE': item.DATA_TYPE
					}
					);
				}
			}
			);
			var saveData = JSON.stringify(pri.saveData);
			pub.isSaveSuccessfully = false;
			$('.overlay').show();
			executeScript('saveData', pri.saveConfirmation, saveData);
		}
		else
		{
			$('#validation-modal').modal('show');
		}
	};
	//------------------------------------------------------------------------------
	pri.saveConfirmation = function (errorMsg)
	{
		if (errorMsg)
		{
			_echo(errorMsg); // DEBUG
			pri.notifyUser('alert', _X('error_on_page') + errorMsg);
		}
		else
		{
			pub.isSaveSuccessfully = true;
			pri.notifyUser('success', _X('data_save_message'));
		}
		back();
	};
	//------------------------------------------------------------------------------
	pri.validate = function ()
	{
		var errorMsg = '';
		var isRepFailed = false;
		$.each(pri.formData, function (index, item)
		{
			// FxM | 2017-12-08 | Test against '1' as only empty string is false
			if ((item.SORT_ORDER <= -1) && (item.IS_MANDATORY === '1') && (item.IS_VISIBLE === '1'))
			{
				// FxM | 2017-12-08 | Add quotes around field label
				// Normalized the messages to "subject,verb,what" e.g. "field label,is,wrong/not a date/etc."
				if (item.DATA_TYPE == 'E' && $('#' + item.FIELD_NAME).val() && !pri.validateEmail($('#' + item.FIELD_NAME).val()))
				{
					errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"' + _X('email_address_validation_message') + '</li>';
					$('#' + item.FIELD_NAME).removeClass('is-invalid').addClass('is-invalid');
				}
				else if (item.DATA_TYPE == 'S' && pri.isCanvasBlank(document.getElementById(item.FIELD_NAME)))
				{
					if (!isRepFailed)
					{
						errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"' + _X('required_text_message') + '</li>';
					}
					isRepFailed = true;
				}
				else if (item.DATA_TYPE == 'B' && !$('#' + item.FIELD_NAME).is(':checked'))
				{
					errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"' + _X('required_text_message') + '</li>';
				}
				else if (!$('#' + item.FIELD_NAME).val() && item.DATA_TYPE != 'S')
				{
					errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"' + _X('required_text_message') + '</li>';
					$('#' + item.FIELD_NAME).removeClass('is-invalid').addClass('is-invalid');
				}
			}
		}
		);
		if (!$('#' + pri.termsCheckBox.FIELD_NAME).is(':checked'))
		{
			errorMsg += '<li>' + pri.termsCheckBox.FIELD_LABEL + _X('required_text_message') + '</li>';
			$('#' + pri.termsCheckBox.FIELD_NAME).removeClass('is-invalid').addClass('is-invalid');
		}
		if (errorMsg != "")
		{
			$('#validation-message').empty();
			$('#validation-message').html('<ul class="validation-summary-errors">' + errorMsg + '</ul>');
			return false;
		}
		return true;
	}
	//------------------------------------------------------------------------------
	pub.previewSignature = function ()
	{
		pri.writeInPdf(false);
	};
	//------------------------------------------------------------------------------
	pub.clearSignature = function (element)
	{
		pri[element.id].clear();
	};
	//------------------------------------------------------------------------------
	pri.writeInPdf = function (isSave)
	{
		_echo('writeInPdf: Creating PDF'); // DEBUG
		$('.overlay').show();

		// FxM | 2017-12-10 | Create blank PDF document of 210mm wide and 552mm high (max)
		//var doc = new jsPDF();
		var doc = new jsPDF('p', 'mm', [552, 210]);

		_echo('writeInPdf: Adding document picture'); // DEBUG
		doc.addImage(pri.imageData, pri.attachment_type, 0, 0, 210, 0);

		doc.setFontSize(9);

		_echo('writeInPdf: Adding field values'); // DEBUG
		$.each(pri.formData, function (index, item)
		{
			// FxM | 2017-12-08 | Test against '0' as only empty string is false
			// Even non-rendered (invisible) fields should be written to pdf if they have a page number != 0
			// This is to pre-fill invisible rendered fields
			if (item.PAGE_NUMBER !== '0')
			{
				if (item.PAGE_NUMBER == 1 && item.DATA_TYPE == 'B' && $('#' + item.FIELD_NAME).is(":checked"))
				{
					doc.rect(item.LEFT, item.TOP, 3, 3, 'F');
				}
				else if (item.PAGE_NUMBER == 1 && item.DATA_TYPE == 'D' && $('#' + item.FIELD_NAME).val())
				{
					var date = new Date($('#' + item.FIELD_NAME).val());
					var formatedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
					doc.text(item.LEFT, item.TOP, formatedDate);
				}
				else if (item.PAGE_NUMBER == 1 && $('#' + item.FIELD_NAME).val())
				{
					doc.text(item.LEFT, item.TOP, $('#' + item.FIELD_NAME).val());
				}
				else if (pri.isRegisterSignaturePad && item.DATA_TYPE == 'S')
				{
					var image = pri.cropSignatureCanvas(document.getElementById(item.FIELD_NAME));
					if (image)
					{
						pri.saveData.push(
						{
							'FIELD_NAME': item.FIELD_NAME,
							'FIELD_VALUE': image.data,
							'FIELD_DATATYPE': item.DATA_TYPE
						}
						);
						doc.addImage(image.data, 'PNG', item.LEFT, item.TOP, image.width, image.height);
					}
					else
					{
						pri.saveData.push(
						{
							'FIELD_NAME': item.FIELD_NAME,
							'FIELD_VALUE': "",
							'FIELD_DATATYPE': item.DATA_TYPE
						}
						);
					}
				}
			}
		}
		);
		if (isSave)
		{
			$('.overlay').hide();
			return doc.output('datauristring');
		}
		pri.viewInCanvas(doc.output('datauristring'), 'pdfPreviewInCanvas', 3, false);
		//$("#pdf_preview").attr("src", doc.output('datauristring'));
	}
	//------------------------------------------------------------------------------
	pri.drawpdfInIframe = function (base64Data, iFrameId)
	{
		var doc = new jsPDF();
		pri.imageData = base64Data;
		doc.addImage(base64Data, 'JPEG', 0, 0, 210, 0);
		$(iFrameId).attr("src", doc.output('datauristring'));
	}
	//------------------------------------------------------------------------------
	pri.viewInCanvas = function (base64Data, canvasId, scale, isHiddenCanvas)
	{
		var data = base64Data.replace('data:application/pdf;base64,', '');
		var pdfData = atob(data);
		PDFJS.workerSrc = 'lib/pdfjs/pdf.worker.js';
		var loadingTask = PDFJS.getDocument(
			{
				data: pdfData
			}
			);
		loadingTask.promise.then(function (pdf)
		{
			// Fetch the first page
			var pageNumber = 1;
			pdf.getPage(pageNumber).then(function (page)
			{
				pri.viewport = page.getViewport(scale);
				console.log(pri.viewport);
				// Prepare canvas using PDF page dimensions
				var canvas = document.getElementById(canvasId);
				var context = canvas.getContext('2d');
				canvas.height = pri.viewport.height;
				canvas.width = pri.viewport.width;
				// Render PDF page into canvas context
				var renderContext =
				{
					canvasContext: context,
					viewport: pri.viewport
				};
				var renderTask = page.render(renderContext);
				renderTask.then(function ()
				{
					$('.overlay').hide();
					if (isHiddenCanvas)
					{
						pri.attachment_type = "PNG";
						pri.imageData = pri.getPixelsFromImageElement(canvasId);

					}
				}
				);
			}
			);
		}, function (reason)
		{
			// PDF loading error
			pri.notifyUser('alert', reason);
		}
		);
	};
	//------------------------------------------------------------------------------
	pub.selectaFormulary = function (element, formulary)
	{
		$('.table-row').removeClass('active');
		$(element).addClass('active');
		pri.selectedFormulary = formulary;
		pri.isRenderHtml = false;
		pri.isRegisterSignaturePad = false;
		pri.hasSignature = false;
		$('.overlay').show();
		//get base64 data from database by selected formulary
		executeScript('loadDocumentsFile', pri.pdfPreview, pri.selectedFormulary);
		//pri.pdfPreview(Constant.formularyABase64Data);
	};
	//------------------------------------------------------------------------------
	pri.convertByteArrayToString = function (data)
	{
		var uarr = new Uint16Array(data);
		var strData = '',
		chunksize = 0xffff;
		var len = uarr.byteLength;
		// There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
		for (var i = 0; i * chunksize < len; i++)
		{
			strData += String.fromCharCode.apply(null, uarr.subarray(i * chunksize, (i + 1) * chunksize));
		}
		return strData;
	}
	//------------------------------------------------------------------------------
	pri.pdfPreview = function (jsonData)
	{
		if (jsonData && jsonData.documentsFile && jsonData.documentsFile.length != 0)
		{
			try
			{
				documentsFile = jsonData.documentsFile;
				var strData = atob(documentsFile[0].ATTACHMENT_CONTENT);
				// Convert binary string to character-number array
				var charData = strData.split('').map(function (x)
					{
						return x.charCodeAt(0);
					}
					);
				// Turn number array into byte-array
				var binData = new Uint8Array(charData);
				// Pako magic
				var data = pako.inflate(binData);
				// Convert gunzipped byteArray back to ascii string:
				var strData = pri.convertByteArrayToString(data);
				// Output to console - PDF in base64
				var btoaData = btoa(strData);
				pri.viewInCanvas(btoaData, 'formularyInCanvas', 3, false);
				pri.viewInCanvas(btoaData, 'hiddenCanvas', 3, true);
				$('#next-view').removeAttr('disabled');
			}
			catch (err)
			{
				pri.notifyUser('alert', _X('error_description_message') + err.message);
			}
		}
		else
		{
			pri.notifyUser('alert', _X('no_data_found_message'));
		}
	}
	//------------------------------------------------------------------------------
	pri.addNewlines = function addNewlines(value, length)
	{
		var result = '';
		while (value.length > 0)
		{
			result += value.substring(0, length) + '\n';
			value = value.substring(200);
		}
		return result;
	};
	//------------------------------------------------------------------------------
	pri.generateHtmlForm = function ()
	{
		_echo('generateHtmlForm: start'); // DEBUG

		$('.overlay').show();
		var documentID = pri.selectedFormulary;

		//get dynamic fields details from database depend on formulary selection
		//For now getting data from a variable
		executeScript('regionFieldsData', pri.renderAttributes, documentID);
		//pri.renderAttributes(JSON.stringify(Constant.formularyAFields));
	}
	//------------------------------------------------------------------------------
	pri.renderAttributes = function (data)
	{
		_echo('renderAttributes: start'); // DEBUG

		customerFields = data.customerFields;
		var div = $('#fill-attributes-form');
		div.empty();
		if (data && data.length != 0)
		{
			pri.formData = customerFields;
			var filterData = [];

			$.each(customerFields, function (index, item)
			{
				if (item.SORT_ORDER >= 1 && item.IS_VISIBLE === '1')
				{
					filterData.push(this);
				}
			});
			
			filterData.sort(function (a, b)
			{
				return a.SORT_ORDER - b.SORT_ORDER;
			});

			var html = '';
			var i = 1;
			var isFirstRow = false;
			try
			{
				$.each(filterData, function (index, value)
				{
					var isOdd = pri.isOddNumber(value.SORT_ORDER);
					var isOddField = pri.isOddNumber(i);
					if (isOdd)
					{
						if (!isFirstRow)
						{
							html += '<div class="form-row">';
						}
						else
						{
							html += '<div class="form-group col-lg-6 col-sm-6">&nbsp;</div></div><div class="form-row">';
						}
						isFirstRow = true;
					}
					else if (!isOdd && !isFirstRow)
					{
						html += '<div class="form-row"><div class="form-group col-lg-6 col-sm-6">&nbsp;</div>';
					}
					else
					{
						if (!html)
						{
							html += '<div class="form-row">';
						}
						isFirstRow = false;
					}
					html += pri.generateHtmlControl(value);
					if (!isOdd || i == filterData.length)
					{
						html += '</div>'
					}
					i++;
				});
			}
			catch (err)
			{
				_echo('Error: ' + err.message); // DEBUG
				pri.notifyUser('alert', _X('error_description_message') + err.message);
			}
			div.append(html);
			pri.renderReviewAndSignScreen();
		}
		else
		{
			_echo('Alert: no data found'); // DEBUG
			pri.notifyUser('alert', _X('no_data_found_message'));
		}
	
	_echo('renderAttributes: end'); // DEBUG
	}
	//------------------------------------------------------------------------------
	pri.isEvenNumber = function (value)
	{
		if (value % 2 == 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	//------------------------------------------------------------------------------
	pri.isOddNumber = function (value)
	{
		if (value % 2 == 0)
		{
			return false;
		}
		else
		{
			return true;
		}
	}
	//------------------------------------------------------------------------------
	pri.generateHtmlControl = function (item)
	{
		var event = 'onclick="App.removeClass(this,\'is-invalid\')" ';
		var html = '<div class="form-group col-lg-6 col-sm-6">';
		if (item.FIELD_INIT == null)
		{
			item.FIELD_INIT = '';
		}
		var inputType = pri.controlType(item.DATA_TYPE);
		if (item.DATA_TYPE == 'I')
		{
			event += "onkeypress='return event.charCode >= 48 && event.charCode <= 57'"
		}
		else if (item.DATA_TYPE == 'N')
		{
			event += " onkeypress='return !(event.charCode != 46 && event.charCode > 31 && (event.charCode < 48 || event.charCode > 57))' "
		}
		if (item.DATA_TYPE == 'B')
		{
			html += '<label style="width:100%;margin-top:.5rem;">&nbsp;</label><label class="custom-control custom-checkbox">' +
			'<input type="checkbox" id="' + item.FIELD_NAME + '" ' + event + ' class="custom-control-input">' +
			'<span class="custom-control-indicator"></span>' +
			'<span class="custom-control-description">' + item.FIELD_LABEL + '</span></label></div>';
		}
		else
		{
			html += '<label for="' + item.FIELD_NAME + '">' + item.FIELD_LABEL + '</label>' +
			'<input type="' + inputType + '" ' + event + ' class="form-control" value="' + item.FIELD_INIT + '" id="' + item.FIELD_NAME + '" placeholder="Enter ' + item.FIELD_LABEL + '"></div>';
		}
		console.log('generateHtmlControl:' + item);
		console.log(html);
		return html;
	};
	//------------------------------------------------------------------------------
	pri.renderReviewAndSignScreen = function ()
	{
		var dynamicFields = [];
		try
		{
			$.each(pri.formData, function (index, item)
			{
				if (item.SORT_ORDER <= -1 && item.IS_VISIBLE === '1')
				{
					dynamicFields.push(item);
				}
			});
			
			dynamicFields.sort(function (a, b)
			{
				return a.SORT_ORDER < b.SORT_ORDER;
			});
			
			var div = $('#signature-section');
			div.empty();
			var html = '';
			
			$.each(dynamicFields, function (index, item)
			{
				html += '<div class="form-group">' + pri.generateOneColumnControl(item) + '</div>';
			});
			
			html += '<div class="form-group">' + pri.generateOneColumnControl(pri.termsCheckBox) + '</div>';
			if (pri.hasSignature)
			{
				html += '<button type="button" onclick="App.previewSignature()" class="btn btn-success margin-right-10">' + _X('preview_button_label') + '</button>';
			}
			
			div.append(html);
			$('.overlay').hide();
		}
		catch (err)
		{
			_echo('renderReviewAndSignScreen: Alert='+err.message); // DEBUG
			pri.notifyUser('alert', _X('error_description_message') + err.message);
		}
	}
	//------------------------------------------------------------------------------
	pri.generateOneColumnControl = function (item)
	{
		var event = 'onclick="App.removeClass(this,\'is-invalid\')" ';
		var inputType = pri.controlType(item.DATA_TYPE);
		if (item.FIELD_INIT == null)
		{
			item.FIELD_INIT = '';
		}
		if (inputType == 'number' && item.DATA_TYPE == 'I')
		{
			event += "onkeypress='return event.charCode >= 48 && event.charCode <= 57'"
		}
		if (inputType == 'checkbox')
		{
			return '<label class="custom-control custom-checkbox">' +
			'<input type="checkbox" id="' + item.FIELD_NAME + '" ' + event + ' class="custom-control-input">' +
			'<span class="custom-control-indicator"></span>' +
			'<span class="custom-control-description">' + item.FIELD_LABEL + '</span>' +
			'</label>';
		}
		if (inputType == 'signature')
		{
			var dimensions = pri.getSignatureDimensions();
			pri.hasSignature = true;
			return '<label for="' + item.FIELD_NAME + '">' + item.FIELD_LABEL + '</label>' +
			'<div class="wrapper"><canvas id="' + item.FIELD_NAME + '" class="signature-pad" width="' + dimensions.width + '" height="' + dimensions.height + '"></canvas></div>' +
			'<div class="custom-row"><button type="button" onclick="App.clearSignature(' + item.FIELD_NAME + ')" class="btn btn-success">' + _X('clear_button_label') + '</button></div>';
		}
		else
		{
			return '<label for="' + item.FIELD_NAME + '">' + item.FIELD_LABEL + '</label>' +
			'<input type="' + inputType + '" ' + event + ' class="form-control" value="' + item.FIELD_INIT + '" id="' + item.FIELD_NAME + '" placeholder="Enter ' + item.FIELD_LABEL + '">';
		}

	};
	//------------------------------------------------------------------------------
	pri.getSignatureDimensions = function ()
	{
		var dimensions =
		{
			width: 380,
			height: 160
		};

		if ($(window).width() <= 700)
		{
			dimensions =
			{
				width: 249,
				height: 110
			};
		}
		else if ($(window).width() <= 768)
		{
			dimensions =
			{
				width: 288,
				height: 110
			};
		}
		else if ($(window).width() <= 850)
		{
			dimensions =
			{
				width: 322,
				height: 125
			};
		}
		else if ($(window).width() <= 1024)
		{
			dimensions =
			{
				width: 310,
				height: 135
			};
		}
		else if ($(window).width() <= 1200)
		{
			dimensions =
			{
				width: 380,
				height: 160
			};
		}
		return dimensions;
	}
	//------------------------------------------------------------------------------
	pri.controlType = function (value)
	{
		var controlType = 'text';
		switch (value)
		{
		case 'A':
			controlType = 'text';
			break;
		case 'D':
			controlType = 'date';
			break;
		case 'I':
			controlType = 'number';
			break;
		case 'N':
			controlType = 'number';
			break;
		case 'E':
			controlType = 'email';
			break;
		case 'S':
			controlType = 'signature';
			break;
		case 'B':
			controlType = 'checkbox';
			break;
		}
		return controlType;
	}
	//------------------------------------------------------------------------------
	pri.validateEmail = function (email)
	{
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}
	//------------------------------------------------------------------------------
	pri.validateAttributes = function ()
	{
		var errorMsg = '';
		$.each(pri.formData, function (index, item)
		{
			// FxM | 2017-12-08 | Test against '1' as only empty string is false
			if ((item.SORT_ORDER >= 1) && (item.IS_MANDATORY === '1') && (item.IS_VISIBLE === '1'))
			{
				// FxM | 2017-12-08 | Add quotes around field label
				// Normalized the messages to "subject,verb,what" e.g. "field label,is,wrong/not a date/etc."
				if (item.DATA_TYPE == 'E' && $('#' + item.FIELD_NAME).val() && !pri.validateEmail($('#' + item.FIELD_NAME).val()))
				{
					errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"' + _X('email_address_validation_message') + '</li>'
					$('#' + item.FIELD_NAME).removeClass('is-invalid').addClass('is-invalid');
				}
				else if (item.DATA_TYPE == 'B' && !$('#' + item.FIELD_NAME).is(':checked'))
				{
					errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"' + _X('required_text_message') + '</li>';
					$('#' + item.FIELD_NAME).removeClass('is-invalid').addClass('is-invalid');
				}
				else if (item.DATA_TYPE == 'D' && $('#' + item.FIELD_NAME).val() && !pri.isDate($('#' + item.FIELD_NAME).val()))
				{
					errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"' + _X('date_validation_message') + '</li>'
					$('#' + item.FIELD_NAME).removeClass('is-invalid').addClass('is-invalid');
				}
				else if (!$('#' + item.FIELD_NAME).val())
				{
					errorMsg += '<li>' + '"' + item.FIELD_LABEL + '"'  + _X('required_text_message') + '</li>';
					$('#' + item.FIELD_NAME).removeClass('is-invalid').addClass('is-invalid');
				}
			}
		});

		if (errorMsg != "")
		{
			$('#validation-message').empty();
			$('#validation-message').html('<ul class="validation-summary-errors">' + errorMsg + '</ul>');
			return false;
		}
		return true;
	}
	//------------------------------------------------------------------------------
	pub.removeClass = function (element, cssClass)
	{
		$(element).removeClass(cssClass);
	}
	//------------------------------------------------------------------------------
	pri.registerSignaturePad = function ()
	{
		$.each(pri.formData, function (index, item)
		{
			// FxM | 2017-12-08 | All signatures are initialized/rendered/written2pdf
			// Otherwise, what's the point? Also, the page number indicates where to write the signature
			//if (item.PAGE_NUMBER == 0 && item.DATA_TYPE == 'S' && item.IS_VISIBLE)
			if (item.DATA_TYPE == 'S')
			{
				var signaturePad = new SignaturePad(document.getElementById(item.FIELD_NAME),
					{
						backgroundColor: 'rgba(255, 255, 255, 0)',
						penColor: 'rgb(0, 0, 0)'
					}
					);
				pri[item.FIELD_NAME] = signaturePad;
			}
		}
		);

	}
	//------------------------------------------------------------------------------
	pri.cropSignatureCanvas = function (canvas)
	{
		// First duplicate the canvas to not alter the original
		var croppedCanvas = document.createElement('canvas'),
		croppedCtx = croppedCanvas.getContext('2d');

		croppedCanvas.width = canvas.width;
		croppedCanvas.height = canvas.height;
		croppedCtx.drawImage(canvas, 0, 0);

		// Next do the actual cropping
		var w = croppedCanvas.width,
		h = croppedCanvas.height,
		pix =
		{
			x: [],
			y: []
		},
		imageData = croppedCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height),
		x,
		y,
		index;

		for (y = 0; y < h; y++)
		{
			for (x = 0; x < w; x++)
			{
				index = (y * w + x) * 4;
				if (imageData.data[index + 3] > 0)
				{
					pix.x.push(x);
					pix.y.push(y);
				}
			}
		}
		pix.x.sort(function (a, b)
		{
			return a - b
		}
		);
		pix.y.sort(function (a, b)
		{
			return a - b
		}
		);
		var n = pix.x.length - 1;

		w = pix.x[n] - pix.x[0];
		h = pix.y[n] - pix.y[0];
		if (!w || !h)
		{
			return null;
		}
		var cut = croppedCtx.getImageData(pix.x[0], pix.y[0], w, h);

		croppedCanvas.width = w;
		croppedCanvas.height = h;
		croppedCtx.putImageData(cut, 0, 0);
		var size = pri.resizeImage(croppedCanvas.width, croppedCanvas.height, 57, 20);
		return (
		{
			data: croppedCanvas.toDataURL(),
			width: size[0],
			height: size[1]
		});
	}
	//------------------------------------------------------------------------------
	pri.resizeImage = function (width, height, maxWidth, maxHeight, ratio)
	{
		// Check if the current width is larger than the max
		if (width > maxWidth)
		{
			ratio = maxWidth / width; // get ratio for scaling image
			height = height * ratio; // Reset height to match scaled image
			width = width * ratio; // Reset width to match scaled image
		}
		// Check if current height is larger than max
		if (height > maxHeight)
		{	
			ratio = maxHeight / height; // get ratio for scaling image
			width = width * ratio; // Reset width to match scaled image
			height = height * ratio; // Reset height to match scaled image
		}
		return [width, height]
	};
	//------------------------------------------------------------------------------
	pri.isCanvasBlank = function (canvas)
	{
		var blank = document.createElement('canvas');
		blank.width = canvas.width;
		blank.height = canvas.height;
		return canvas.toDataURL() == blank.toDataURL();
	};
	//------------------------------------------------------------------------------
	pri.getPixelsFromImageElement = function (canvasId)
	{
		var element = document.getElementById(canvasId);
		return element.toDataURL();
		//var ctx = canvas.getContext("2d");
		//return ctx.getImageData(0,0,canvas.width,canvas.height);
	}
	//------------------------------------------------------------------------------
	pri.isDate = function (date)
	{
		return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
	}

	return pub;

}(); // end of App object

// kick it
////////////////////////////////////////////////////////////////////////////////
$(document).ready(function ()
{
	// Load available documents
	App.loadFormulary();
	$('#formulary-table').on('click', '.table-row', function ()
	{
		var value = $(this).attr("data-value");
		App.selectaFormulary(this, value);
	});

	$('#error-message-modal').on('hidden.bs.modal', function (e)
	{
		if (App.isSaveSuccessfully)
		{
			App.isSaveSuccessfully = false;
			window.location.reload(true);
		}
	});
	
	// Setup labels

	$('#application_title').text(_X('application_title'));
	$("#screen_3_instructions").text(_X('screen_3_instructions'));
	$('#screen_2_instructions').text(_X('screen_2_instructions'));
	$('#screen_1_instructions').text(_X('screen_1_instructions'));
	$('#cancel_button_label').text(_X('cancel_button_label'));
	$('#previous-view').text(_X('previous_button_label'));
	$('#next-view').text(_X('next_button_label'));
	$('#validate-form').text(_X('validate_button_label'));
	$("#doclist_col_name_label").text(_X('doclist_col_name_label'));
	$('#doclist_col_version_label').text(_X('doclist_col_version_label'));
	$('#doclist_col_publish_label').text(_X('doclist_col_publish_label'));
	$('#doclist_col_signed_label').text(_X('doclist_col_signed_label'));
	$('#validation_error_header').text(_X('validation_error_header'));
	$('#validate-button_label').text(_X('validate_button_label'));
	$('#close_button_label').text(_X('close_button_label'));
	$('#close_error_label').text(_X('close_button_label'));

	// set the width to 100% so we can use the whole space available
	var w = window.parent;
	var e = w.document.getElementById('HTMLCallbackEventHandler');
	if (e) e.style.width = "100%";

	var e = w.document.getElementById('htmlwrapper');
	if (e) e.style.width = "100%";

	var e = w.document.getElementById('detailContent');
	if (e) e.style = "overflow: hidden; padding: 0px; margin: 0px";

	var e = w.document.getElementById('detail');
	if (e) e.style = "padding-left: 0px; padding-right: 2px;"; //top: 7px;";
});

//==============================================================================
// EOS