
		var bo = Get("BusinessObject");
		 var alignmentId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@ALIGNMENT_ID");
		 var serverCallInit = Get("ServerCall");
		 var documentId = serverCallInit.Parameter;
		 
		
		var documents="SELECT * FROM (SELECT "+
								"	D.DOCUMENT_ID AS DOCUMENT_ID, D.REF_ID AS REF_ID, D.NAME AS DOCUMENT_NAME, D.DESCRIPTION AS DESCRIPTION, "+
								"	H.FILE_NAME AS FILE_NAME, H.ATTACHMENT_TYPE AS ATTACHMENT_TYPE, H.VERSION AS VERSION, to_char(H.ATTACHMENT_DATE,'DD/MM/YYYY') AS PUBLISH_DATE, H.ATTACHMENT_CONTENT AS ATTACHMENT_CONTENT "+
								" , RANK() OVER (PARTITION BY D.REF_ID ORDER BY H.VERSION DESC) AS RK "+
							"	FROM "+
								"	DOCUMENT D, DOCUMENT_HISTORY H "+
								"	WHERE "+
									"	H.DOCUMENT_ID = D.DOCUMENT_ID "+
									" AND D.REF_ID='-888' " +
								"	AND D.DOCUMENT_ID IN "+
									"	( "+
									"	SELECT DD.DOCUMENT_ID "+
									"	FROM "+
										"	DOCUMENT_DISTRIBUTION DD, ALIGNMENT ALGN "+
									"	WHERE "+
										"	ALGN.ALIGNMENT_ID = -999 "+
									"	AND ( "+
											"	(DD.USER_TYPE = 'EMPL' AND DD.EXTERNAL_ID = ALGN.EMPLOYEE_ID) "+
										"	OR	(DD.USER_TYPE = 'ALGN' AND DD.EXTERNAL_ID = ALGN.MANAGER_ALIGNMENT_ID AND (DD.ALIGNMENT_ROLE IS NULL OR DD.ALIGNMENT_ROLE = ALGN.ROLE)) "+
										"	OR	(DD.USER_TYPE = 'TEAM' AND DD.EXTERNAL_ID = ALGN.TEAM_ID AND (DD.ALIGNMENT_ROLE IS NULL OR DD.ALIGNMENT_ROLE = ALGN.ROLE)) "+
										"	)) )  WHERE RK=1";
		var documents_sub = documents.Replace("-999", alignmentId);
		var documents_subfile = documents_sub.Replace("-888", documentId);
		
        var documentsFileReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
        documentsFileReq.CreateParams["query_sql"] = documents_subfile;
        var documentsFileResp = DataRequest.Execute(documentsFileReq);
        var documentsFileTable = documentsFileResp.Data.Tables['vt_query'];
        var documentsFileJson = JsonSerializeTable(documentsFileTable);
		
	   var value = '{"documentsFile":' + documentsFileJson + '}';
		var serverCall = Get("ServerCall");
		serverCall.Result = value;


