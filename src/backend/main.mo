import Map "mo:core/Map";
import Int "mo:core/Int";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
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

  public type RunningLog = {
    distance : Float; // Distance in kilometers
    time : Int; // Time in nanoseconds
    pace : Float; // Average pace (minutes per km)
    timestamp : Int; // Timestamp in nanoseconds
    completed : Bool; // Indicates if the run was completed
  };

  public type DailyIntake = {
    date : Int;
    amount : Float;
  };

  public type UserData = {
    dailyGoal : Float; // ml
    cupSize : Float; // ml
  };

  public type HydrationLog = {
    date : Int;
    totalIntake : Float;
  };

  public type SleepLog = {
    date : Int;
    hours : Float;
  };

  public type CustomReminderDefinition = {
    name : Text;
    description : Text;
    intervalInNanos : Int; // Reminder interval in nanoseconds
    lastSent : Int; // Last sent timestamp in nanoseconds
    enabled : Bool; // Whether the reminder is enabled
  };

  public type ReminderType = {
    #water;
    #running;
    #sleep;
    #custom;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userData = Map.empty<Principal, UserData>();
  let runningLogs = Map.empty<Principal, List.List<RunningLog>>();
  let userIntakeHistory = Map.empty<Principal, List.List<HydrationLog>>();
  let customReminders = Map.empty<Principal, Map.Map<Text, CustomReminderDefinition>>();
  let sleepLogs = Map.empty<Principal, List.List<SleepLog>>();

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

  //////////////////////////////////////////////////////////////////////
  /// Sleep Tracking Functions
  //////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func addSleepLog(hours : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log sleep");
    };

    let today = Time.now() / 86400000000000;
    let newSleepLog = { date = today; hours };

    let userSleepLogs = switch (sleepLogs.get(caller)) {
      case (null) {
        List.singleton<{ date : Int; hours : Float }>(newSleepLog);
      };
      case (?existingLogs) {
        var todayExists = false;
        var updatedLogs = List.empty<SleepLog>();

        // Explicitly specify type parameters for map
        let mappedLogs = existingLogs.map<SleepLog, SleepLog>(
          func(log) {
            if (log.date == today) {
              todayExists := true;
              ({ log with hours = log.hours + hours });
            } else { log };
          }
        );

        // Update logs from mapped entries
        updatedLogs := List.fromArray(mappedLogs.toArray());

        // Remove entries older than 6 days
        updatedLogs := updatedLogs.filter(func(log) { today - log.date <= 6 });

        // Add the new log if today doesn't exist
        if (not todayExists) {
          return updatedLogs.add(newSleepLog);
        };

        updatedLogs;
      };
    };

    sleepLogs.add(caller, userSleepLogs);
  };

  public query ({ caller }) func getTodaysSleep() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access sleep data");
    };

    let today = Time.now() / 86400000000000;

    switch (sleepLogs.get(caller)) {
      case (null) { 0 };
      case (?logs) {
        switch (logs.find(func(log) { log.date == today })) {
          case (null) { 0 };
          case (?log) { log.hours };
        };
      };
    };
  };

  public query ({ caller }) func getSleepHistory() : async [SleepLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access sleep history");
    };

    switch (sleepLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.toArray();
      };
    };
  };

  //////////////////////////////////////////////////////////////////////
  /// Hydration Tracking Functions
  //////////////////////////////////////////////////////////////////////
  public shared ({ caller }) func updateUserSettings(
    dailyGoal : Float,
    cupSize : Float,
  ) : async () {
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

  //////////////////////////////////////////////////////////////////////
  /// Running Tracker
  //////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func logRun(
    distance : Float,
    time : Int,
    pace : Float,
    completed : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log runs");
    };

    let currentLogs = switch (runningLogs.get(caller)) {
      case (null) {
        List.empty<{
          distance : Float;
          time : Int;
          pace : Float;
          timestamp : Int;
          completed : Bool;
        }>();
      };
      case (?logs) { logs };
    };

    currentLogs.add({
      distance;
      time;
      pace;
      timestamp = Time.now();
      completed;
    });

    runningLogs.add(caller, currentLogs);
  };

  public query ({ caller }) func getRunningHistory() : async [RunningLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access running history");
    };

    let currentHistory = switch (runningLogs.get(caller)) {
      case (null) { List.empty<RunningLog>() };
      case (?history) { history };
    };

    currentHistory.toArray();
  };

  public query ({ caller }) func getTodaysRuns() : async [RunningLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access running data");
    };

    let today = Time.now() / 86400000000000;
    let currentLogs = switch (runningLogs.get(caller)) {
      case (null) { List.empty<RunningLog>() };
      case (?logs) { logs };
    };

    let days = currentLogs.filter(
      func(run) {
        run.timestamp / 86400000000000 == today;
      }
    );
    days.toArray();
  };

  //////////////////////////////////////////////////////////////////////
  /// Custom Reminders System
  //////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func addCustomReminder(
    name : Text,
    description : Text,
    interval : Int,
    enabled : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reminders");
    };

    let currentReminders = customReminders.get(caller);
    let userReminders = switch (currentReminders) {
      case (null) {
        Map.empty<Text, CustomReminderDefinition>();
      };
      case (?reminders) { reminders };
    };

    let reminderDefinition : CustomReminderDefinition = {
      name;
      description;
      intervalInNanos = interval;
      lastSent = 0;
      enabled;
    };

    userReminders.add(name, reminderDefinition);
    customReminders.add(caller, userReminders);
  };

  public shared ({ caller }) func updateCustomReminder(
    name : Text,
    description : Text,
    interval : Int,
    enabled : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update reminders");
    };

    switch (customReminders.get(caller)) {
      case (null) {
        Runtime.trap("Reminder definitions not found for user");
      };
      case (?reminderMap) {
        switch (reminderMap.get(name)) {
          case (null) {
            Runtime.trap("Reminder not found");
          };
          case (?existingReminder) {
            let updatedReminder = {
              existingReminder with
              description;
              intervalInNanos = interval;
              enabled;
            };
            reminderMap.add(name, updatedReminder);
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeCustomReminder(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove reminders");
    };

    switch (customReminders.get(caller)) {
      case (null) {
        Runtime.trap("Reminder definition not found for user");
      };
      case (?reminders) {
        reminders.remove(name);
      };
    };
  };

  public query ({ caller }) func listCustomReminders() : async [CustomReminderDefinition] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access reminders");
    };

    let reminderMap = switch (customReminders.get(caller)) {
      case (null) {
        Map.empty<Text, CustomReminderDefinition>();
      };
      case (?reminders) { reminders };
    };
    reminderMap.values().toArray();
  };
};
