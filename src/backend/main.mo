import Map "mo:core/Map";
import Int "mo:core/Int";
import List "mo:core/List";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  public type DailyIntake = {
    date : Int;
    amount : Float;
  };

  public type UserData = {
    dailyGoal : Float;
    cupSize : Float;
  };

  public type HydrationLog = {
    date : Int;
    totalIntake : Float;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userData = Map.empty<Principal, UserData>();
  let userIntakeHistory = Map.empty<Principal, List.List<HydrationLog>>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Hydration tracking functions
  public shared ({ caller }) func updateUserSettings(dailyGoal : Float, cupSize : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update settings");
    };

    userData.add(
      caller,
      {
        dailyGoal;
        cupSize;
      },
    );
  };

  public query ({ caller }) func getUserSettings() : async ?UserData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access settings");
    };
    userData.get(caller);
  };

  public shared ({ caller }) func addDailyIntake(amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log intake");
    };

    let today = Time.now() / 86400000000000;
    let newLog = { date = today; totalIntake = amount };

    let intakeHistory : List.List<HydrationLog> = switch (userIntakeHistory.get(caller)) {
      case (null) {
        List.singleton<{ date : Int; totalIntake : Float }>(newLog);
      };
      case (?existingLogs) {
        var todayExists = false;
        var updatedLogs = List.empty<HydrationLog>();

        // Explicitly specify type parameters for map
        let mappedLogs = existingLogs.map<HydrationLog, HydrationLog>(
          func(log) {
            if (log.date == today) {
              todayExists := true;
              ({ log with totalIntake = log.totalIntake + amount });
            } else { log };
          }
        );

        // Update logs from mapped entries
        updatedLogs := List.fromArray(mappedLogs.toArray());

        // Remove entries older than 6 days
        updatedLogs := updatedLogs.filter(func(log) { today - log.date <= 6 });

        // Add the new log if today doesn't exist
        if (not todayExists) {
          return updatedLogs.add(newLog);
        };

        updatedLogs;
      };
    };

    userIntakeHistory.add(caller, intakeHistory);
  };

  public query ({ caller }) func getTodaysIntake() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access intake data");
    };

    let today = Time.now() / 86400000000000;

    switch (userIntakeHistory.get(caller)) {
      case (null) { 0 };
      case (?logs) {
        switch (logs.find(func(log) { log.date == today })) {
          case (null) { 0 };
          case (?log) { log.totalIntake };
        };
      };
    };
  };

  public query ({ caller }) func getIntakeHistory() : async [HydrationLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access intake history");
    };

    switch (userIntakeHistory.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.toArray();
      };
    };
  };
};
