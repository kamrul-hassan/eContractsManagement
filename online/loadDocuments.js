
		var bo = Get("BusinessObject");
		 var alignmentId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@ALIGNMENT_ID");
		 
		
		var documents="SELECT docs.*, ' ' AS LAST_SIGNED_DATE FROM (SELECT "+
								"	D.DOCUMENT_ID AS DOCUMENT_ID, D.REF_ID AS REF_ID, D.NAME AS DOCUMENT_NAME, D.DESCRIPTION AS DESCRIPTION, "+
								"	H.FILE_NAME AS FILE_NAME,  H.VERSION AS VERSION, to_char(H.ATTACHMENT_DATE,'DD/MM/YYYY') AS PUBLISH_DATE "+
								" , RANK() OVER (PARTITION BY D.REF_ID ORDER BY H.VERSION DESC) AS RK "+
							"	FROM "+
								"	DOCUMENT D, DOCUMENT_HISTORY H "+
								"	WHERE "+
									"	H.DOCUMENT_ID = D.DOCUMENT_ID "+
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
										"	)) ) docs WHERE RK=1";
		var documents_sub = documents.Replace("-999", alignmentId);
		
        var documentsReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
        documentsReq.CreateParams["query_sql"] = documents_sub;
        var documentsResp = DataRequest.Execute(documentsReq);
        var documentsTable = documentsResp.Data.Tables['vt_query'];
        var documentsJson = JsonSerializeTable(documentsTable);
		
	   var value = '{"documents":' + documentsJson + '}';
		var serverCall = Get("ServerCall");
		serverCall.Result = value;


