with (helper) {

		 var alignmentId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@ALIGNMENT_ID");
		
		var documentId = Control.WebView.EvaluateJavascript("getOfflineParameter('loadDocumentsFile')");
		 
		
		var documents="SELECT "+
								"	MAX(H.DOCUMENT_HISTORY_ID), D.DOCUMENT_ID AS DOCUMENT_ID, D.REF_ID AS REF_ID, D.NAME AS DOCUMENT_NAME, D.DESCRIPTION AS DESCRIPTION, "+
								"	H.FILE_NAME AS FILE_NAME, H.ATTACHMENT_TYPE AS ATTACHMENT_TYPE, H.VERSION AS VERSION, date(H.ATTACHMENT_DATE) AS PUBLISH_DATE, H.ATTACHMENT_CONTENT AS ATTACHMENT_CONTENT "+
							"	FROM "+
								"	DOCUMENT D, DOCUMENT_HISTORY H "+
								"	WHERE "+
									"	H.DOCUMENT_ID = D.DOCUMENT_ID "+
									" AND D.REF_ID='"+ documentId +"' " +
								"	AND D.DOCUMENT_ID IN "+
									"	( "+
									"	SELECT DD.DOCUMENT_ID "+
									"	FROM "+
										"	DOCUMENT_DISTRIBUTION DD, ALIGNMENT ALGN "+
									"	WHERE "+
										"	ALGN.ALIGNMENT_ID = "+alignmentId+" "+
									"	AND ( "+
											"	(DD.USER_TYPE = 'EMPL' AND DD.EXTERNAL_ID = ALGN.EMPLOYEE_ID) "+
										"	OR	(DD.USER_TYPE = 'ALGN' AND DD.EXTERNAL_ID = ALGN.MANAGER_ALIGNMENT_ID AND (DD.ALIGNMENT_ROLE IS NULL OR DD.ALIGNMENT_ROLE = ALGN.ROLE)) "+
										"	OR	(DD.USER_TYPE = 'TEAM' AND DD.EXTERNAL_ID = ALGN.TEAM_ID AND (DD.ALIGNMENT_ROLE IS NULL OR DD.ALIGNMENT_ROLE = ALGN.ROLE)) "+
										"	))  ";
		
        var documentsFileReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
        documentsFileReq.CreateParams["query_sql"] = documents;
        var documentsFileResp = DataRequest.Execute(documentsFileReq);
        var documentsFileTable = documentsFileResp.Data.Tables['vt_query'];
        var documentsFileJson = JsonSerializeTable(documentsFileTable);
		
	   var value = '{"documentsFile":' + documentsFileJson + '}';
		Control.WebView.EvaluateJavascript("performOfflineScriptCallback('loadDocumentsFile', '" + value + "')");

}
