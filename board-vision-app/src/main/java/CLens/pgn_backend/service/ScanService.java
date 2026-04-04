package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.repository.UserRepository;
import CLens.pgn_backend.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class ScanService {

    private final UserRepository users;

    @Value("${app.trial.days:2}")
    private int trialDays;

    @Value("${app.trial.dailyLimit:3}")
    private int trialDailyLimit;

    public record Allowance(int trialRemainingToday, int adCredits, int paidCredits, int totalAvailable) {}

    public ScanService(UserRepository users) {
        this.users = users;
    }

    /** Public helper for UI to show remaining allowances */
    public Allowance getAllowance(User u) {
        normalizeUserTrialCounters(u);

        boolean inTrial = isInTrial(u);
        int trialRemaining = inTrial ? Math.max(0, u.getTrialDailyLimit() - u.getTrialUsedToday()) : 0;

        int ad = Optional.ofNullable(u.getAdScanCredits()).orElse(0);
        int paid = Optional.ofNullable(u.getPaidScanCredits()).orElse(0);
        int total = trialRemaining + ad + paid;

        return new Allowance(trialRemaining, ad, paid, total);
    }

    /** Deduct one scan with priority: trialToday → adCredits → paidCredits */
    public void consumeOne(User u) {
        normalizeUserTrialCounters(u);

        // compute current allowance
        Allowance a = getAllowance(u);
        if (a.totalAvailable() <= 0) {
            throw new IllegalStateException("No scans available. Use ads or buy a pack.");
        }

        // prefer trial of the day
        if (a.trialRemainingToday() > 0) {
            u.setTrialUsedToday(u.getTrialUsedToday() + 1);
        } else if (a.adCredits() > 0) {
            u.setAdScanCredits(a.adCredits() - 1);
        } else {
            u.setPaidScanCredits(a.paidCredits() - 1);
        }
        users.save(u);  // Save after updating the user's scan counts
    }

    /** Grant ad credits (Watch Ad → +1 scan by default) */
    public Allowance grantAd(User u, int count) {
        if (count <= 0) {
            throw new IllegalArgumentException("Credit count must be positive");
        }
        u.setAdScanCredits(Optional.ofNullable(u.getAdScanCredits()).orElse(0) + count);
        users.save(u);
        return getAllowance(u);
    }

    /** Grant paid pack credits (50/100/200/500 etc.) */
    public void grantPack(User u, int count) {
        if (count <= 0) {
            throw new IllegalArgumentException("Credit count must be positive");
        }
        u.setPaidScanCredits(Optional.ofNullable(u.getPaidScanCredits()).orElse(0) + count);
        users.save(u);
    }

    // ---------- internal helpers ----------

    private void normalizeUserTrialCounters(User u) {
        // init trial params if user is fresh
        if (u.getTrialStart() == null) {
            u.setTrialStart(LocalDate.now());
            u.setTrialDays(trialDays);
            u.setTrialDailyLimit(trialDailyLimit);
            u.setTrialCounterDay(LocalDate.now());
            u.setTrialUsedToday(0);
        }
        // reset per-day counter if new day
        if (u.getTrialCounterDay() == null || !LocalDate.now().equals(u.getTrialCounterDay())) {
            u.setTrialCounterDay(LocalDate.now());
            u.setTrialUsedToday(0);
        }
    }

    private boolean isInTrial(User u) {
        if (u.getTrialStart() == null) {
            return false; // User has no trial start date
        }
        LocalDate end = u.getTrialStart().plusDays(u.getTrialDays());
        return !LocalDate.now().isAfter(end);
    }
}
