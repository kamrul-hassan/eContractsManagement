with (helper) {
		 var alignmentId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@ALIGNMENT_ID");
		 
		
		var documents="SELECT a.*, ' ' AS LAST_SIGNED_DATE FROM (SELECT "+
												" d.document_id AS DOCUMENT_ID, d.REF_ID, d.name AS DOCUMENT_NAME, d.description AS DESCRIPTION, "+
												" h.file_name AS FILE_NAME, h.attachment_type AS ATTACHMENT_TYPE, h.version as VERSION, date(H.ATTACHMENT_DATE) AS PUBLISH_DATE, h.attachment_content AS ATTACHMENT_CONTENT "+
												" FROM "+
												" document d, document_history h "+
												" WHERE "+
												" h.document_id = d.document_id "+
												" AND d.document_id IN "+
												" ( "+
												" SELECT dd.document_id "+
												" FROM "+
												" document_distribution dd, alignment algn "+
												" WHERE "+
												" algn.alignment_id = "+alignmentId+" "+
												" AND ( "+
												" (dd.user_type = 'EMPL' AND dd.external_id = algn.employee_id) "+
												" OR (dd.user_type = 'ALGN' AND dd.external_id = algn.manager_alignment_id AND (dd.alignment_role IS NULL OR dd.alignment_role = algn.role)) "+
												" OR (dd.user_type = 'TEAM' AND dd.external_id = algn.team_id AND (dd.alignment_role IS NULL OR dd.alignment_role = algn.role)) "+
												" ) "+
												" )) A,(SELECT	 "+
												" MAX(h.version) as MAx_version,D.REF_ID "+
												" FROM "+
												" document d, document_history h "+
												" WHERE "+
												" h.document_id = d.document_id "+
												" AND d.document_id IN "+
												" ( "+
												" SELECT dd.document_id "+
												" FROM "+
												" document_distribution dd, alignment algn "+
												" WHERE "+
												" algn.alignment_id = "+alignmentId+" "+
												" AND ( "+
												" (dd.user_type = 'EMPL' AND dd.external_id = algn.employee_id) "+
												" OR (dd.user_type = 'ALGN' AND dd.external_id = algn.manager_alignment_id AND (dd.alignment_role IS NULL OR dd.alignment_role = algn.role)) "+
												" OR (dd.user_type = 'TEAM' AND dd.external_id = algn.team_id AND (dd.alignment_role IS NULL OR dd.alignment_role = algn.role)) "+
												" )) GROUP BY D.REF_ID) B "+
												" WHERE A.REF_ID=B.REF_ID and b.MAx_version=a.version";
				
        var documentsReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
        documentsReq.CreateParams["query_sql"] = documents;
        var documentsResp = DataRequest.Execute(documentsReq);
        var documentsTable = documentsResp.Data.Tables['vt_query'];
        var documentsJson = JsonSerializeTable(documentsTable);
		
	   var value = '{"documents":' + documentsJson + '}';
		Control.WebView.EvaluateJavascript("performOfflineScriptCallback('loadDocuments', '" + value + "')");
}
