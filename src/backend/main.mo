import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
  };

  public type RewardType = {
    #plastic_pirate;
    #runner;
    #hydrator;
    #sleepyhead;
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

  public type UserRewards = {
    streak : Nat;
    badges : [RewardType];
    completedGoals : Nat;
    lastUpdated : Int; // Day number of last streak update (not nanoseconds)
  };

  public type UserAnalytics = {
    totalHydrationLogs : Nat;
    totalRunningLogs : Nat;
    totalSleepLogs : Nat;
    lastActiveDay : Int; // Day in nanoseconds when last active
  };

  public type AnalyticsMetrics = {
    totalUniqueUsers : Nat;
    dailyActiveUsers : Nat;
    weeklyActiveUsers : Nat;
    totalHydrationEvents : Nat;
    totalRunningEvents : Nat;
    totalSleepEvents : Nat;
  };

  public type UserAnalyticsEntry = {
    principal : Principal;
    profileName : Text;
    issuedDay : Int;
    hydrationLogs : Nat;
    runningLogs : Nat;
    sleepLogs : Nat;
  };

  // Storage Maps
  var userRewards = Map.empty<Principal, UserRewards>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userData = Map.empty<Principal, UserData>();
  let runningLogs = Map.empty<Principal, List.List<RunningLog>>();
  let userIntakeHistory = Map.empty<Principal, List.List<HydrationLog>>();
  let customReminders = Map.empty<Principal, Map.Map<Text, CustomReminderDefinition>>();
  let sleepLogs = Map.empty<Principal, List.List<SleepLog>>();
  var userAnalytics = Map.empty<Principal, UserAnalytics>();

  ///////////////////////////////////////////////////////////////////////////////
  // User Profile Management
  ///////////////////////////////////////////////////////////////////////////////

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
  /// Rewards & Gamification
  //////////////////////////////////////////////////////////////////////

  public query ({ caller }) func getUserRewards() : async UserRewards {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access rewards");
    };
    switch (userRewards.get(caller)) {
      case (?rewards) { rewards };
      case (null) { { streak = 0; badges = []; completedGoals = 0; lastUpdated = 0 } };
    };
  };

  func updateRewards(caller : Principal, streak : Nat, completedGoals : Nat, currentBadges : [RewardType], lastUpdatedDay : Int) {
    let newBadges = currentBadges;
    let updatedRewards = {
      streak;
      badges = newBadges;
      completedGoals;
      lastUpdated = lastUpdatedDay;
    };
    userRewards.add(caller, updatedRewards);
  };

  //////////////////////////////////////////////////////////////////////
  /// Sleep Tracking
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

        let mappedLogs = existingLogs.map<SleepLog, SleepLog>(
          func(log) {
            if (log.date == today) {
              todayExists := true;
              ({ log with hours = log.hours + hours });
            } else { log };
          }
        );

        updatedLogs := List.fromArray(mappedLogs.toArray());
        updatedLogs := updatedLogs.filter(func(log) { today - log.date <= 6 });

        if (not todayExists) {
          return updatedLogs.add(newSleepLog);
        };

        updatedLogs;
      };
    };

    sleepLogs.add(caller, userSleepLogs);

    // Update analytics
    let currentAnalytics = switch (userAnalytics.get(caller)) {
      case (?analytics) { analytics };
      case (null) { { totalHydrationLogs = 0; totalRunningLogs = 0; totalSleepLogs = 0; lastActiveDay = today } };
    };
    let updatedAnalytics = {
      currentAnalytics with
      totalSleepLogs = currentAnalytics.totalSleepLogs + 1;
      lastActiveDay = today;
    };
    userAnalytics.add(caller, updatedAnalytics);
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
  /// Hydration Tracking
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

        let mappedLogs = existingLogs.map<HydrationLog, HydrationLog>(
          func(log) {
            if (log.date == today) {
              todayExists := true;
              ({ log with totalIntake = log.totalIntake + amount });
            } else { log };
          }
        );

        updatedLogs := List.fromArray(mappedLogs.toArray());
        updatedLogs := updatedLogs.filter(func(log) { today - log.date <= 6 });

        if (not todayExists) {
          return updatedLogs.add(newLog);
        };

        updatedLogs;
      };
    };

    userIntakeHistory.add(caller, intakeHistory);
    updateStreak(caller, today);

    // Update analytics
    let currentAnalytics = switch (userAnalytics.get(caller)) {
      case (?analytics) { analytics };
      case (null) { { totalHydrationLogs = 0; totalRunningLogs = 0; totalSleepLogs = 0; lastActiveDay = today } };
    };
    let updatedAnalytics = {
      currentAnalytics with
      totalHydrationLogs = currentAnalytics.totalHydrationLogs + 1;
      lastActiveDay = today;
    };
    userAnalytics.add(caller, updatedAnalytics);
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
      case (?logs) { logs.toArray() };
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

    // Update analytics
    let todayDay = Time.now() / 86400000000000;
    let currentAnalytics = switch (userAnalytics.get(caller)) {
      case (?analytics) { analytics };
      case (null) { { totalHydrationLogs = 0; totalRunningLogs = 0; totalSleepLogs = 0; lastActiveDay = todayDay } };
    };
    let updatedAnalytics = {
      currentAnalytics with
      totalRunningLogs = currentAnalytics.totalRunningLogs + 1;
      lastActiveDay = todayDay;
    };
    userAnalytics.add(caller, updatedAnalytics);
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

  ////////////////////////////////////////////////////////////////////////
  // Streak calculation & completion tracking
  ////////////////////////////////////////////////////////////////////////

  func updateStreak(caller : Principal, today : Int) {
    let todayIntake = getTodaysIntakeInternal(caller, today);
    let userSettings = getUserSettingsInternal(caller);

    switch (todayIntake, userSettings) {
      case (?intake, ?settings) {
        if (intake >= settings.dailyGoal) {
          updateStreakInternal(caller, today);
        } else {
          // Goal not met today, check if we need to reset streak
          checkAndResetStreak(caller, today);
        };
      };
      case (_) {
        // No intake or settings, check if we need to reset streak
        checkAndResetStreak(caller, today);
      };
    };
  };

  func getTodaysIntakeInternal(caller : Principal, today : Int) : ?Float {
    switch (userIntakeHistory.get(caller)) {
      case (null) { null };
      case (?logs) {
        switch (logs.find(func(log) { log.date == today })) {
          case (null) { null };
          case (?log) { ?log.totalIntake };
        };
      };
    };
  };

  func getUserSettingsInternal(caller : Principal) : ?UserData {
    userData.get(caller);
  };

  func checkAndResetStreak(caller : Principal, today : Int) {
    let currentReward = switch (userRewards.get(caller)) {
      case (?rewards) { rewards };
      case (null) { return }; // No rewards to reset
    };

    // If lastUpdated is not yesterday, reset streak to 0
    if (currentReward.lastUpdated > 0 and today > currentReward.lastUpdated + 1) {
      updateRewards(
        caller,
        0,
        currentReward.completedGoals,
        currentReward.badges,
        today,
      );
    };
  };

  func updateStreakInternal(caller : Principal, today : Int) {
    let currentReward = switch (userRewards.get(caller)) {
      case (?rewards) { rewards };
      case (null) { { streak = 0; badges = []; completedGoals = 0; lastUpdated = 0 } };
    };

    // Calculate new streak based on consecutive days
    let newStreak = if (currentReward.lastUpdated == 0) {
      // First time logging
      1;
    } else if (today == currentReward.lastUpdated) {
      // Same day, don't increment
      currentReward.streak;
    } else if (today == currentReward.lastUpdated + 1) {
      // Consecutive day, increment
      currentReward.streak + 1;
    } else {
      // Missed day(s), reset to 1
      1;
    };

    updateRewards(
      caller,
      newStreak,
      currentReward.completedGoals + 1,
      currentReward.badges,
      today,
    );
  };

  ///////////////////////////////////////////////
  // Analytics Tracking
  ///////////////////////////////////////////////

  public shared ({ caller }) func getAnalyticsMetrics() : async AnalyticsMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access analytics");
    };

    let now = Time.now() / 86400000000000; // Current day

    let allValues = userAnalytics.values().toArray();

    let dailyActiveUsers = allValues.filter(
      func(user) {
        Int.abs(user.lastActiveDay - now) <= 1;
      }
    ).size();

    let weeklyActiveUsers = allValues.filter(
      func(user) {
        Int.abs(user.lastActiveDay - now) <= 7;
      }
    ).size();

    var totalHydration = 0;
    var totalRunning = 0;
    var totalSleep = 0;

    allValues.forEach(
      func(user) {
        totalHydration += user.totalHydrationLogs;
        totalRunning += user.totalRunningLogs;
        totalSleep += user.totalSleepLogs;
      }
    );

    {
      totalUniqueUsers = userAnalytics.size();
      dailyActiveUsers;
      weeklyActiveUsers;
      totalHydrationEvents = totalHydration;
      totalRunningEvents = totalRunning;
      totalSleepEvents = totalSleep;
    };
  };

  public shared ({ caller }) func getAllUserAnalytics() : async [UserAnalyticsEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access analytics");
    };

    let entries = userAnalytics.toArray();

    let userAnalyticsEntries = entries.map(
      func((principal, analytics)) {
        {
          principal;
          profileName = switch (userProfiles.get(principal)) {
            case (?profile) { profile.name };
            case (null) {
              "Unknown";
            };
          };
          issuedDay = analytics.lastActiveDay;
          hydrationLogs = analytics.totalHydrationLogs;
          runningLogs = analytics.totalRunningLogs;
          sleepLogs = analytics.totalSleepLogs;
        };
      }
    );
    userAnalyticsEntries;
  };
};
