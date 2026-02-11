import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old types
  type OldUserAnalytics = {
    totalHydrationLogs : Nat;
    totalRunningLogs : Nat;
    totalSleepLogs : Nat;
    lastActiveDay : Int;
  };

  // Old actor
  type OldActor = {
    userAnalytics : Map.Map<Principal, OldUserAnalytics>;
  };

  // New type
  type NewUserAnalytics = {
    totalHydrationLogs : Nat;
    totalRunningLogs : Nat;
    totalSleepLogs : Nat;
  };

  // New actor
  type NewActor = {
    userAnalytics : Map.Map<Principal, NewUserAnalytics>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userAnalytics = old.userAnalytics.map<Principal, OldUserAnalytics, NewUserAnalytics>(
        func(_principal, oldAnalytics) {
          {
            totalHydrationLogs = oldAnalytics.totalHydrationLogs;
            totalRunningLogs = oldAnalytics.totalRunningLogs;
            totalSleepLogs = oldAnalytics.totalSleepLogs;
          };
        }
      );
    };
  };
};
