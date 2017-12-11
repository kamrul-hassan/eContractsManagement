with (helper) {
	
	var alignmentId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@ALIGNMENT_ID");
	var dateToday = EffectiveDateHelper.Now(bo.CreateParams.UserToken);
	var userToken = CdlIPhoneSettings.SessionData.UserToken;
	
		var currentBo = CdlIPhoneSettings.Organizer.BusinessObject;
		var callBoGuid = currentBo.CreateParams.ExtendedProperties["fromguid"];
		var callBO = Dendrite.Framework.BOAccessHelper.ResurrectBusinessObject(callBoGuid, ".bo");
		
	var DocData = Control.WebView.EvaluateJavascript("getOfflineParameter('saveData')");
	var tblDocData = JsonDeserializeTable(DocData);
	
		var cust_Id = callBO.Data.GetValue("customer/customer_id");
		var cust_Name=callBO.Data.GetValue("customer/name");
		var eventID = callBO.Data.GetValue("event/event_id");
		
		var eventTbl = callBO.Data.get_Item("event").Table;
        var eventRow = eventTbl.Rows[0];
		var tableED = callBO.Data.get_Item("dynamic__7888500000206232").Table;
		var eventattch=callBO.Data.get_Item("event_attachment").Table;
				
		var finalPDF_id;
		var pdf_file;
		var cip_code;
		// To store attributes value to database
		for(var i=0; i<tblDocData.Rows.Count; i++)
		{
			var dataRow = tblDocData.Rows[i];
			
				var newRowED = tableED.NewRow();
				newRowED.BeginEdit();
				if(dataRow["FIELD_NAME"]=="PdfFileID")
				{
				finalPDF_id=dataRow["FIELD_VALUE"];
				}
				if(dataRow["FIELD_NAME"]=="CIPCode")
				{
				cip_code=dataRow["FIELD_VALUE"];
				}
				newRowED["TEXT_1"] = finalPDF_id;
				if(dataRow["FIELD_NAME"]=="finalPdfFile")
				{
				pdf_file=dataRow["FIELD_VALUE"];
				}
				if(dataRow["FIELD_DATATYPE"]=='A')
				{
					newRowED["TEXT_2"] =dataRow["FIELD_NAME"];
					newRowED["CODE_1"] =dataRow["FIELD_DATATYPE"];
					newRowED["TEXT_5"] = dataRow["FIELD_VALUE"];
				}
				if(dataRow["FIELD_DATATYPE"]=='I')
				{
					newRowED["TEXT_2"] =dataRow["FIELD_NAME"];
					newRowED["CODE_1"] =dataRow["FIELD_DATATYPE"];
					newRowED["NUMBER_5"] = dataRow["FIELD_VALUE"];
				}
				if(dataRow["FIELD_DATATYPE"]=='N')
				{
					newRowED["TEXT_2"] =dataRow["FIELD_NAME"];
					newRowED["CODE_1"] =dataRow["FIELD_DATATYPE"];
					newRowED["NUMBER_5"] = dataRow["FIELD_VALUE"];
				}
				if(dataRow["FIELD_DATATYPE"]=='E')
				{
					newRowED["TEXT_2"] =dataRow["FIELD_NAME"];
					newRowED["CODE_1"] =dataRow["FIELD_DATATYPE"];
					newRowED["TEXT_5"] = dataRow["FIELD_VALUE"];
				}
				if(dataRow["FIELD_DATATYPE"]=='D')
				{
					newRowED["TEXT_2"] =dataRow["FIELD_NAME"];
					newRowED["CODE_1"] =dataRow["FIELD_DATATYPE"];
					newRowED["DATE_5"] = dataRow["FIELD_VALUE"];
				}
				if(dataRow["FIELD_DATATYPE"]=='S')
				{
					newRowED["TEXT_2"] =dataRow["FIELD_NAME"];
					newRowED["CODE_1"] =dataRow["FIELD_DATATYPE"];
				}
				if(dataRow["FIELD_DATATYPE"]=='B')
				{
					newRowED["TEXT_2"] =dataRow["FIELD_NAME"];
					newRowED["CODE_1"] =dataRow["FIELD_DATATYPE"];
				}
				if(dataRow["FIELD_NAME"]!="PdfFileID" && dataRow["FIELD_NAME"]!="finalPdfFile" && dataRow["FIELD_DATATYPE"]!='S')
				{
				newRowED.SetParentRow(eventRow);
				newRowED.EndEdit();
				tableED.Rows.Add(newRowED);
				}
			//}
		}
		
		// To store document attachment to database
		
		var newRowEA = eventattch.NewRow();
		
		var fields = pdf_file.split(';');
		var type=fields[0];
		var split_colon=type.split(":");
		var file_type=split_colon[1];		
		var doc_file=fields[1].split(",");
		var documentFile=doc_file[1];
		
		newRowEA.BeginEdit();
		newRowEA["ALIGNMENT_ID"] = alignmentId;
		newRowEA["ATTACHMENT_DATE"] = dateToday;
		newRowEA["CREATE_DATE"] = dateToday;
		newRowEA["DOCUMENT_TYPE"] = file_type;
		newRowEA["FILE_NAME"] = cust_Name+"_"+cip_code+"_"+finalPDF_id +"_"+dateToday.ToString("ddMMyyyy")+"_"+"vsignée"+ ".pdf";
		newRowEA["DOCUMENT_FILE"] = Convert.FromBase64String(documentFile);
		newRowEA.SetParentRow(eventRow);
		newRowEA.EndEdit();
		eventattch.Rows.Add(newRowEA);	
		
		SaveBusinessObject(callBO, callBoGuid, ".bo");
		
		var value = 0;
		Control.WebView.EvaluateJavascript("performOfflineScriptCallback('saveData', '" + value + "')");
}

	
	

