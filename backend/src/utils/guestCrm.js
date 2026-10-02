function normalizeGuestSearchTerm(term) {
  if (typeof term !== 'string') {
    return '';
  }

  return term.trim().toLowerCase();
}

function buildGuestSummary(guest, bookingStats, complaintStats, feedbackStats) {
  return {
    name: guest?.full_name || 'Unknown Guest',
    loyalty_points: Number(guest?.loyalty_points || 0),
    total_visits: Number(guest?.total_visits || 0),
    total_spending: Number(guest?.total_spending || 0),
    total_bookings: Number(bookingStats?.totalBookings || 0),
    last_stay: bookingStats?.lastStay || null,
    recent_status: bookingStats?.recentStatus || null,
    open_complaints: Number(complaintStats?.openComplaints || 0),
    average_rating: Number(feedbackStats?.averageRating || 0),
  };
}

module.exports = {
  normalizeGuestSearchTerm,
  buildGuestSummary,
};
