var req = MI.IPhoneHttpRequest.Current; 
		var req = MI.IPhoneHttpRequest.Current;
		if (req != null)
		{
			var query = new System.Collections.Specialized.NameValueCollection();
			query.Add("EventId",req.Query["EventId"]);
			query.Add("CUSTOMERID",req.Query["CUSTOMERID"]);
			query.Add("AffiliationId",req.Query["AffiliationId"]);
			query.Add("GROUPCALLID",req.Query["GROUPCALLID"]);
			query.Add("AUTOPOPULATE",req.Query["AUTOPOPULATE"]);
			query.Add("pageguid",req.Query["fromguid"]);
			AppDelegate.Instance.StartShield(false, true);
			AppDelegate.Instance.Navigate("calls", "lock", "calls.cdl", null, query, null);
			AppDelegate.Instance.EndShield(false, true);
		}
		else
		{
			AppDelegate.Instance.StartShield(false, true);
			AppDelegate.Instance.Navigate("home", "mobile", "home.cdl", null, new System.Collections.Specialized.NameValueCollection(), null);
			AppDelegate.Instance.EndShield(false, true);
		}