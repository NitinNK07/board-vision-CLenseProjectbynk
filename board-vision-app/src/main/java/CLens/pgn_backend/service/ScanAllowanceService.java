package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScanAllowanceService {
    private final UserRepository users;

    public record Allowance(int trialRemainingToday, int adCredits, int paidCredits, int totalAvailable) {}

    public Allowance getAllowance(User u) {
        // init trial on first use
        if (u.getTrialStart() == null) {
            u.setTrialStart(LocalDate.now());
            u.setTrialCounterDay(LocalDate.now());
            u.setTrialUsedToday(0);
        }
        // reset daily counter
        if (!LocalDate.now().equals(u.getTrialCounterDay())) {
            u.setTrialCounterDay(LocalDate.now());
            u.setTrialUsedToday(0);
        }
        // check if still within trial window
        boolean inTrial = !LocalDate.now().isAfter(u.getTrialStart().plusDays(u.getTrialDays() - 1));
        int trialRemainingToday = inTrial ? Math.max(0, u.getTrialDailyLimit() - u.getTrialUsedToday()) : 0;

        int ad = Optional.ofNullable(u.getAdScanCredits()).orElse(0);
        int paid = Optional.ofNullable(u.getPaidScanCredits()).orElse(0);
        int total = trialRemainingToday + ad + paid;
        users.save(u);
        return new Allowance(trialRemainingToday, ad, paid, total);
    }

    public void consumeOne(User u) {
        Allowance a = getAllowance(u);
        if (a.totalAvailable() <= 0) throw new IllegalStateException("No scans available");
        // priority: trial -> ad -> paid
        if (a.trialRemainingToday() > 0) {
            u.setTrialUsedToday(u.getTrialUsedToday() + 1);
        } else if (a.adCredits() > 0) {
            u.setAdScanCredits(u.getAdScanCredits() - 1);
        } else {
            u.setPaidScanCredits(u.getPaidScanCredits() - 1);
        }
        users.save(u);
    }

    public void grantAdCredit(User u, int count) {
        u.setAdScanCredits(Optional.ofNullable(u.getAdScanCredits()).orElse(0) + count);
        users.save(u);
    }

    public void grantPack(User u, int count) {
        u.setPaidScanCredits(Optional.ofNullable(u.getPaidScanCredits()).orElse(0) + count);
        users.save(u);
    }
}

