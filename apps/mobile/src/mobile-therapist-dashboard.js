import React, { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';

import {
  getLangLabel,
  languageOptions,
  RADIUS,
  resolveMediaUrl,
  SPACE,
  TYPE,
} from './mobile-utils';
import {
  ComplianceStatusStep,
  getComplianceStatusLabel,
} from './mobile-compliance-step';

function StatusMiniCard({ icon, label, value, color, c }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: RADIUS.md,
        padding: SPACE.md,
        gap: SPACE.xs,
        backgroundColor: c.card,
      }}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ ...TYPE.label, color: c.textMuted ?? c.muted }}>{label}</Text>
      <Text style={{ ...TYPE.meta, color, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

export function TherapistDashboardScreen(props) {
  const {
    c,
    documentUploading,
    editAvailability,
    editBio,
    editHomeVisit,
    editIsVisible,
    editGender,
    editKassenart,
    editLanguages,
    editHealthAuthorityStatus,
    editMode,
    editServiceRadius,
    editSpecializations,
    editTaxRegistrationStatus,
    handlePickDocument,
    handlePickPhoto,
    handleSaveProfile,
    loggedInTherapist,
    onEnterEdit,
    profileSaving,
    setEditAvailability,
    setEditBio,
    setEditHomeVisit,
    setEditIsVisible,
    setEditGender,
    setEditKassenart,
    setEditLanguages,
    setEditHealthAuthorityStatus,
    setEditMode,
    setEditServiceRadius,
    setEditSpecializations,
    setEditTaxRegistrationStatus,
    styles,
    t,
    therapistDocuments,
    incomingBookings,
    onRespondToBooking,
    editBookingMode,
    setEditBookingMode,
    mySlots,
    onAddSlot,
    onCancelSlot,
    slotsLoading,
  } = props;

  const [photoError, setPhotoError] = useState(false);

  // Slot-Picker State
  const [slotPickerDate, setSlotPickerDate] = useState(null);   // Date object
  const [slotPickerHour, setSlotPickerHour] = useState(null);   // 0-23
  const [slotPickerMinute, setSlotPickerMinute] = useState(null); // 0 or 30
  const [slotPickerDuration, setSlotPickerDuration] = useState(20);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });

  const SLOT_DURATIONS = [20, 30, 40, 50, 60];
  const TIME_HOURS = [7,8,9,10,11,12,13,14,15,16,17,18,19];

  const slotIsInFuture = useMemo(() => {
    if (slotPickerDate === null || slotPickerHour === null || slotPickerMinute === null) return null;
    const dt = new Date(slotPickerDate);
    dt.setHours(slotPickerHour, slotPickerMinute, 0, 0);
    return dt > new Date() ? dt : null;
  }, [slotPickerDate, slotPickerHour, slotPickerMinute]);

  const slotReady = slotIsInFuture !== null;

  function formatSlotDate(d) {
    if (!d) return 'Datum wählen';
    return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  function formatSlotTime(h, m) {
    if (h === null) return 'Uhrzeit wählen';
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} Uhr`;
  }

  function buildCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay + 6) % 7; // Mo=0
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }

  function handleAddSlot() {
    if (!slotReady) return;
    const iso = slotIsInFuture.toISOString();
    onAddSlot({ startsAt: iso, durationMin: slotPickerDuration });
    setSlotPickerDate(null);
    setSlotPickerHour(null);
    setSlotPickerMinute(null);
    setSlotPickerDuration(20);
  }
  const th = loggedInTherapist;
  if (!th) return null;
  const fullName = typeof th.fullName === 'string' && th.fullName.trim() ? th.fullName.trim() : 'Profil';
  const initials = fullName.split(/\s+/).map((name) => name[0]).join('').slice(0, 2).toUpperCase();
  const reviewStatusLabel = th.reviewStatus === 'APPROVED' ? t('statusApproved') : th.reviewStatus === 'CHANGES_REQUESTED' ? t('statusChangesRequested') : t('statusInReview');
  const reviewStatusColor = th.reviewStatus === 'APPROVED' ? c.success : th.reviewStatus === 'CHANGES_REQUESTED' ? c.warning : c.muted;
  const hasDocuments = (therapistDocuments ?? []).length > 0;
  const pendingBookings = (incomingBookings ?? []).filter(b => b.status === 'PENDING');
  const pendingCount = pendingBookings.length;

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}>
      <View style={[styles.practiceHeader, { backgroundColor: c.card, borderColor: c.border, alignItems: 'center' }]}>
        <Pressable onPress={handlePickPhoto} style={{ position: 'relative' }}>
          {th.photo && !photoError ? (
            <Image source={{ uri: th.photo }} style={[styles.therapistAvatarLarge, { borderRadius: 48 }]} onError={() => setPhotoError(true)} />
          ) : (
            <View style={[styles.therapistAvatarLarge, { borderRadius: 48, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>{initials}</Text>
            </View>
          )}
          <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: c.accent, borderRadius: 12, padding: 4 }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>📷</Text>
          </View>
        </Pressable>
        <Text style={[styles.practiceHeaderName, { color: c.text, marginTop: 10 }]}>{fullName}</Text>
        <Text style={[styles.practiceHeaderCity, { color: c.textMuted ?? c.muted }]}>{th.professionalTitle ?? ''}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm, marginTop: SPACE.sm, width: '100%' }}>
          <StatusMiniCard
            icon="shield-checkmark-outline"
            label={t('reviewStatusLabel')}
            value={reviewStatusLabel}
            color={reviewStatusColor}
            c={c}
          />
          <StatusMiniCard
            icon="eye-outline"
            label={t('visibleLabel')}
            value={th.isVisible ? t('yesLabel') : t('hiddenLabel')}
            color={th.isVisible ? c.success : c.muted}
            c={c}
          />
          <StatusMiniCard
            icon="home-outline"
            label={t('homeVisitLabel')}
            value={th.homeVisit ? t('yesLabel') : t('noLabel')}
            color={th.homeVisit ? c.success : c.muted}
            c={c}
          />
          <StatusMiniCard
            icon="document-outline"
            label={t('documentsTitle')}
            value={hasDocuments ? t('existsLabel') : t('missingLabel')}
            color={hasDocuments ? c.success : c.warning}
            c={c}
          />
        </View>
      </View>

      {editMode ? (
        <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.filterSectionTitle, { color: c.muted }]}>{t('aboutLabel')}</Text>
          <TextInput
            style={[styles.inputField, { color: c.text, borderColor: c.border, backgroundColor: c.mutedBg, minHeight: 80, textAlignVertical: 'top' }]}
            value={editBio}
            onChangeText={setEditBio}
            placeholder={t('bioShortPlaceholder')}
            placeholderTextColor={c.muted}
            multiline
          />
          <Text style={[styles.filterSectionTitle, { color: c.muted, marginTop: 12 }]}>{t('specsCommaSeparated')}</Text>
          <TextInput
            style={[styles.inputField, { color: c.text, borderColor: c.border, backgroundColor: c.mutedBg }]}
            value={editSpecializations}
            onChangeText={setEditSpecializations}
            placeholder={t('specsExamplePlaceholder')}
            placeholderTextColor={c.muted}
          />
          <Text style={[styles.filterSectionTitle, { color: c.muted, marginTop: 12 }]}>{t('languagesLabel')}</Text>
          <LangMultiselect editLanguages={editLanguages} setEditLanguages={setEditLanguages} c={c} styles={styles} t={t} />
          <View style={[styles.detailInfoRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailInfoLabel, { color: c.text }]}>{t('homeVisitOffer')}</Text>
              <Text style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{t('homeVisitOfferSub')}</Text>
            </View>
            <Switch value={editHomeVisit} onValueChange={setEditHomeVisit} trackColor={{ true: c.success }} />
          </View>
          {editHomeVisit && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.filterSectionTitle, { color: c.muted }]}>{t('serviceAreaQuestion')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {[5, 10, 15, 20, 30, 50].map((km) => (
                  <Pressable
                    key={km}
                    onPress={() => setEditServiceRadius(km)}
                    style={[styles.kassenartBtn, {
                      backgroundColor: editServiceRadius === km ? c.success : c.mutedBg,
                      borderColor: editServiceRadius === km ? c.success : c.border,
                    }]}
                  >
                    <Text style={[styles.kassenartText, { color: editServiceRadius === km ? '#fff' : c.text }]}>
                      {km} km
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          <Text style={[styles.filterSectionTitle, { color: c.muted, marginTop: 12 }]}>Geschlecht</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: 12 }}>
            {[{ key: 'female', label: 'Therapeutin' }, { key: 'male', label: 'Therapeut' }].map((opt) => {
              const active = editGender === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setEditGender(active ? null : opt.key)}
                  style={[styles.kassenartBtn, {
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    backgroundColor: active ? c.primary : c.mutedBg,
                    borderColor: active ? c.primary : c.border,
                  }]}
                >
                  <Ionicons name={opt.key === 'female' ? 'female-outline' : 'male-outline'} size={13} color={active ? '#fff' : c.muted} />
                  <Text style={[styles.kassenartText, { color: active ? '#fff' : c.text }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.filterSectionTitle, { color: c.muted, marginTop: 12 }]}>{t('kassenartLabel')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {[
              { key: 'privat', label: t('kassePrivat') },
              { key: 'selbstzahler', label: t('kasseSelbstzahler') },
            ].map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setEditKassenart(option.key)}
                style={[styles.kassenartBtn, {
                  backgroundColor: editKassenart === option.key ? c.primary : c.mutedBg,
                  borderColor: editKassenart === option.key ? c.primary : c.border,
                }]}
              >
                <Text style={[styles.kassenartText, { color: editKassenart === option.key ? '#fff' : c.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.detailInfoRow, { marginTop: 12 }]}>
            <Text style={[styles.detailInfoLabel, { color: c.text, flex: 1 }]}>{t('searchVisibleLabel')}</Text>
            <Switch
              value={editIsVisible}
              onValueChange={setEditIsVisible}
              trackColor={{ true: c.primary }}
              disabled={loggedInTherapist?.reviewStatus !== 'APPROVED'}
            />
          </View>
          <View style={[styles.detailInfoRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailInfoLabel, { color: c.text }]}>{t('bookingModeLabel') ?? 'Terminanfragen aktivieren'}</Text>
              <Text style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{t('bookingModeSub') ?? 'Patienten können direkt einen Termin anfragen.'}</Text>
            </View>
            <Switch
              value={editBookingMode === 'FIRST_APPOINTMENT_REQUEST'}
              onValueChange={(val) => setEditBookingMode(val ? 'FIRST_APPOINTMENT_REQUEST' : 'DIRECTORY_ONLY')}
              trackColor={{ true: c.primary }}
            />
          </View>
          {loggedInTherapist?.reviewStatus !== 'APPROVED' && (
            <Text style={{ fontSize: 12, color: c.muted, marginTop: 4, marginBottom: 4 }}>
              Sichtbarkeit wird nach der Freigabe durch Revio aktiviert.
            </Text>
          )}
          <Text style={[styles.detailInfoLabel, { color: c.muted, marginTop: 14, marginBottom: 4 }]}>{t('availabilityLabel')}</Text>
          <TextInput
            style={[styles.registerInput, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
            value={editAvailability}
            onChangeText={setEditAvailability}
            placeholder={t('availabilityPlaceholder')}
            placeholderTextColor={c.muted}
          />
          <View style={{ marginTop: 14 }}>
            <ComplianceStatusStep
              c={c}
              healthAuthorityStatus={editHealthAuthorityStatus}
              onChangeHealthAuthorityStatus={setEditHealthAuthorityStatus}
              onChangeTaxRegistrationStatus={setEditTaxRegistrationStatus}
              t={t}
              taxRegistrationStatus={editTaxRegistrationStatus}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Pressable style={[styles.registerBtn, { flex: 1, backgroundColor: c.border, marginTop: 0 }]} onPress={() => setEditMode(false)}>
              <Text style={{ ...TYPE.heading, color: c.text }}>{t('cancelBtn')}</Text>
            </Pressable>
            <Pressable style={[styles.registerBtn, { flex: 1, backgroundColor: profileSaving ? c.border : c.primary, marginTop: 0 }]} onPress={handleSaveProfile} disabled={profileSaving}>
              <Text style={styles.registerBtnText}>{profileSaving ? t('savingBtn') : t('saveBtn')}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {/* ── Slot-Verwaltung ─────────────────────────────────────────────── */}
          {(th.bookingMode === 'FIRST_APPOINTMENT_REQUEST' || editBookingMode === 'FIRST_APPOINTMENT_REQUEST') && (
            <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.filterSectionTitle, { color: c.muted }]}>Verfügbare Termine</Text>

              {/* ── Neuen Slot anlegen ───────────────────────────────── */}
              <View style={{ marginBottom: 16, gap: 10 }}>

                {/* Datum */}
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: c.muted, letterSpacing: 0.5, marginBottom: 4 }}>DATUM</Text>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.mutedBg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: slotPickerDate ? c.primary : c.border, paddingHorizontal: 12, paddingVertical: 10 }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={slotPickerDate ? c.primary : c.muted} />
                    <Text style={{ fontSize: 14, color: slotPickerDate ? c.text : c.muted, flex: 1 }}>{formatSlotDate(slotPickerDate)}</Text>
                    {slotPickerDate && <Ionicons name="checkmark-circle" size={16} color={c.primary} />}
                  </Pressable>
                </View>

                {/* Uhrzeit */}
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: c.muted, letterSpacing: 0.5, marginBottom: 4 }}>UHRZEIT</Text>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.mutedBg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: slotPickerHour !== null ? c.primary : c.border, paddingHorizontal: 12, paddingVertical: 10 }}
                  >
                    <Ionicons name="time-outline" size={16} color={slotPickerHour !== null ? c.primary : c.muted} />
                    <Text style={{ fontSize: 14, color: slotPickerHour !== null ? c.text : c.muted, flex: 1 }}>{formatSlotTime(slotPickerHour, slotPickerMinute)}</Text>
                    {slotPickerHour !== null && <Ionicons name="checkmark-circle" size={16} color={c.primary} />}
                  </Pressable>
                </View>

                {/* Dauer */}
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: c.muted, letterSpacing: 0.5, marginBottom: 4 }}>DAUER</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {SLOT_DURATIONS.map(dur => {
                      const active = slotPickerDuration === dur;
                      return (
                        <Pressable
                          key={dur}
                          onPress={() => setSlotPickerDuration(dur)}
                          style={{ flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm, alignItems: 'center', borderWidth: 1.5, borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryBg : c.mutedBg }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: active ? '700' : '400', color: active ? c.primary : c.muted }}>{dur}'</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Fehler: Vergangenheit */}
                {slotPickerDate !== null && slotPickerHour !== null && slotIsInFuture === null && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.errorBg ?? '#FEF2F2', borderRadius: RADIUS.sm, padding: 10 }}>
                    <Ionicons name="alert-circle-outline" size={14} color={c.error} />
                    <Text style={{ fontSize: 12, color: c.error }}>Dieser Zeitpunkt liegt in der Vergangenheit.</Text>
                  </View>
                )}

                {/* Button */}
                <Pressable
                  onPress={handleAddSlot}
                  disabled={!slotReady}
                  style={{ backgroundColor: slotReady ? c.primary : c.border, borderRadius: RADIUS.sm, paddingVertical: 12, alignItems: 'center', marginTop: 2 }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                    {slotReady
                      ? `Termin anlegen · ${formatSlotDate(slotPickerDate)}, ${formatSlotTime(slotPickerHour, slotPickerMinute)}`
                      : '+ Termin anlegen'}
                  </Text>
                </Pressable>
              </View>

              {/* ── Kalender-Modal ─────────────────────────────────────── */}
              <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setShowDatePicker(false)}>
                  <Pressable onPress={() => {}} style={{ backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <Pressable onPress={() => setCalendarMonth(prev => {
                        const d = new Date(prev.year, prev.month - 1); return { year: d.getFullYear(), month: d.getMonth() };
                      })} style={{ padding: 8 }}>
                        <Ionicons name="chevron-back" size={20} color={c.text} />
                      </Pressable>
                      <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: c.text }}>
                        {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                      </Text>
                      <Pressable onPress={() => setCalendarMonth(prev => {
                        const d = new Date(prev.year, prev.month + 1); return { year: d.getFullYear(), month: d.getMonth() };
                      })} style={{ padding: 8 }}>
                        <Ionicons name="chevron-forward" size={20} color={c.text} />
                      </Pressable>
                    </View>
                    {/* Wochentag-Header */}
                    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                      {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => (
                        <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: c.muted }}>{d}</Text>
                      ))}
                    </View>
                    {/* Tage-Grid */}
                    {(() => {
                      const today = new Date(); today.setHours(0,0,0,0);
                      const cells = buildCalendar(calendarMonth.year, calendarMonth.month);
                      const rows = [];
                      for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i+7));
                      return rows.map((row, ri) => (
                        <View key={ri} style={{ flexDirection: 'row', marginBottom: 4 }}>
                          {row.map((day, ci) => {
                            if (!day) return <View key={ci} style={{ flex: 1 }} />;
                            const date = new Date(calendarMonth.year, calendarMonth.month, day);
                            const isPast = date < today;
                            const isSelected = slotPickerDate && date.toDateString() === slotPickerDate.toDateString();
                            return (
                              <Pressable
                                key={ci}
                                disabled={isPast}
                                onPress={() => { setSlotPickerDate(date); setShowDatePicker(false); }}
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7, borderRadius: 20, backgroundColor: isSelected ? c.primary : 'transparent' }}
                              >
                                <Text style={{ fontSize: 14, color: isPast ? c.muted : isSelected ? '#fff' : c.text, fontWeight: isSelected ? '700' : '400', opacity: isPast ? 0.35 : 1 }}>{day}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ));
                    })()}
                    <Pressable onPress={() => setShowDatePicker(false)} style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}>
                      <Text style={{ color: c.muted, fontSize: 14 }}>Abbrechen</Text>
                    </Pressable>
                  </Pressable>
                </Pressable>
              </Modal>

              {/* ── Zeit-Modal ─────────────────────────────────────────── */}
              <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setShowTimePicker(false)}>
                  <Pressable onPress={() => {}} style={{ backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: 360 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 14 }}>Uhrzeit wählen</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {TIME_HOURS.map(h => (
                        <View key={h} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                          {[0, 30].map(m => {
                            const isSelected = slotPickerHour === h && slotPickerMinute === m;
                            // Prüfe ob dieser Zeitslot am gewählten Datum in der Vergangenheit liegt
                            let isPast = false;
                            if (slotPickerDate) {
                              const dt = new Date(slotPickerDate); dt.setHours(h, m, 0, 0);
                              isPast = dt <= new Date();
                            }
                            return (
                              <Pressable
                                key={m}
                                disabled={isPast}
                                onPress={() => { setSlotPickerHour(h); setSlotPickerMinute(m); setShowTimePicker(false); }}
                                style={{ flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, alignItems: 'center', borderWidth: 1.5, borderColor: isSelected ? c.primary : c.border, backgroundColor: isSelected ? c.primaryBg : isPast ? c.mutedBg : c.card, opacity: isPast ? 0.4 : 1 }}
                              >
                                <Text style={{ fontSize: 15, fontWeight: isSelected ? '700' : '400', color: isSelected ? c.primary : isPast ? c.muted : c.text }}>
                                  {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ))}
                    </ScrollView>
                    <Pressable onPress={() => setShowTimePicker(false)} style={{ marginTop: 8, alignItems: 'center', paddingVertical: 10 }}>
                      <Text style={{ color: c.muted, fontSize: 14 }}>Abbrechen</Text>
                    </Pressable>
                  </Pressable>
                </Pressable>
              </Modal>

              {/* Slot-Liste */}
              {slotsLoading ? (
                <Text style={{ fontSize: 13, color: c.muted, textAlign: 'center', paddingVertical: 8 }}>Lädt…</Text>
              ) : !Array.isArray(mySlots) || mySlots.length === 0 ? (
                <Text style={{ fontSize: 13, color: c.muted, textAlign: 'center', paddingVertical: 8 }}>
                  Noch keine Termine angelegt.
                </Text>
              ) : (
                mySlots.filter(s => s.status !== 'CANCELLED').map((slot) => {
                  const d = new Date(slot.startsAt);
                  const label = d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
                    + ' · ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                  const isBooked = slot.status === 'BOOKED';
                  return (
                    <View key={slot.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }}>
                      <Text style={{ fontSize: 13, color: isBooked ? c.primary : c.text, flex: 1 }}>
                        {label} ({slot.durationMin} Min)
                      </Text>
                      {isBooked ? (
                        <View style={{ backgroundColor: c.primaryBg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 11, color: c.primary, fontWeight: '600' }}>Gebucht</Text>
                        </View>
                      ) : (
                        <Pressable onPress={() => onCancelSlot(slot.id)}>
                          <Text style={{ fontSize: 12, color: c.error, paddingHorizontal: 8 }}>Löschen</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}

          {th.bio ? (
            <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.filterSectionTitle, { color: c.muted }]}>{t('aboutLabel')}</Text>
              <Text style={[styles.infoBody, { color: c.text }]}>{th.bio}</Text>
            </View>
          ) : null}

          <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.filterSectionTitle, { color: c.muted }]}>{t('specsLabel')}</Text>
            <View style={styles.tagRow}>
              {(th.specializations ?? []).map((specialization) => (
                <View key={specialization} style={[styles.tag, { backgroundColor: c.mutedBg }]}>
                  <Text style={[styles.tagText, { color: c.text }]}>{specialization}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.filterSectionTitle, { color: c.muted }]}>{t('languagesLabel')}</Text>
            <View style={styles.tagRow}>
              {(th.languages ?? []).map((language) => (
                <View key={language} style={[styles.tag, { backgroundColor: c.mutedBg }]}>
                  <Text style={[styles.tagText, { color: c.muted }]}>{getLangLabel(language)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.detailInfoRow, { marginBottom: 8 }]}>
              <Text style={[styles.detailInfoLabel, { color: c.muted, flex: 1 }]}>{t('homeVisitLabel')}</Text>
              <Text style={[styles.detailInfoValue, { color: c.text }]}>{th.homeVisit ? t('yesLabel') : t('noLabel')}</Text>
            </View>
            {th.homeVisit && th.serviceRadiusKm ? (
              <View style={[styles.detailInfoRow, { marginTop: 8 }]}>
                <Text style={[styles.detailInfoLabel, { color: c.muted, flex: 1 }]}>{t('serviceAreaLabel')}</Text>
                <Text style={[styles.detailInfoValue, { color: c.text }]}>{t('serviceAreaValue').replace('{radius}', th.serviceRadiusKm)}</Text>
              </View>
            ) : null}
            {th.availability ? (
              <View style={[styles.detailInfoRow, { marginTop: 8 }]}>
                <Text style={[styles.detailInfoLabel, { color: c.muted, flex: 1 }]}>{t('availabilityLabel')}</Text>
                <Text style={[styles.detailInfoValue, { color: c.text }]}>{th.availability}</Text>
              </View>
            ) : null}
            <View style={[styles.detailInfoRow, { marginTop: 8 }]}>
              <Text style={[styles.detailInfoLabel, { color: c.muted, flex: 1 }]}>E-Mail</Text>
              <Text style={[styles.detailInfoValue, { color: c.text }]}>{th.email}</Text>
            </View>
          </View>

          <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.filterSectionTitle, { color: c.muted }]}>{t('complianceSectionTitle')}</Text>
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19, marginBottom: 12 }}>
              {t('complianceSectionBody')}
            </Text>
            <View style={[styles.detailInfoRow, { marginBottom: 8 }]}>
              <Text style={[styles.detailInfoLabel, { color: c.muted, flex: 1 }]}>{t('taxRegistrationLabel')}</Text>
              <Text style={[styles.detailInfoValue, { color: c.text }]}>
                {getComplianceStatusLabel(th.compliance?.taxRegistrationStatus, t)}
              </Text>
            </View>
            <View style={[styles.detailInfoRow, { marginTop: 8 }]}>
              <Text style={[styles.detailInfoLabel, { color: c.muted, flex: 1 }]}>{t('healthAuthorityLabel')}</Text>
              <Text style={[styles.detailInfoValue, { color: c.text }]}>
                {getComplianceStatusLabel(th.compliance?.healthAuthorityStatus, t)}
              </Text>
            </View>
            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18, marginTop: 12 }}>
              {t('complianceDisclaimer')}
            </Text>
          </View>

          <Pressable
            style={[styles.registerBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
            onPress={onEnterEdit}
          >
            <Ionicons name="pencil" size={15} color={c.text} />
            <Text style={[styles.registerBtnText, { color: c.text }]}>{t('editProfileBtn')}</Text>
          </Pressable>

          <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.filterSectionTitle, { color: c.muted }]}>{t('documentsTitle')}</Text>
            {(therapistDocuments ?? []).length > 0 && (
              <View style={{ marginBottom: 12 }}>
                {(therapistDocuments ?? []).map((doc) => (
                  <View
                    key={doc.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }}
                  >
                    <Text style={{ fontSize: 16 }}>{doc.mimetype === 'application/pdf' ? '📄' : '🖼️'}</Text>
                    <Text style={{ flex: 1, fontSize: 13, color: c.text }} numberOfLines={1}>{doc.originalName}</Text>
                  </View>
                ))}
              </View>
            )}
            <Pressable
              onPress={handlePickDocument}
              disabled={documentUploading}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, paddingVertical: 10, paddingHorizontal: 14,
                borderRadius: RADIUS.sm, borderWidth: 1,
                borderColor: documentUploading ? c.border : c.primary,
                borderStyle: 'dashed',
              }}
            >
              {documentUploading ? (
                <Text style={{ color: c.muted, fontSize: 13 }}>{t('uploadingDoc')}</Text>
              ) : (
                <>
                  <Ionicons name="attach-outline" size={18} color={c.primary} />
                  <Text style={{ color: c.primary, fontWeight: '600', fontSize: 13 }}>{t('uploadDocBtn')}</Text>
                </>
              )}
            </Pressable>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 8 }}>
              {t('documentsHint')}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// PracticeAdminScreen removed — freelancer-only MVP


function LangMultiselect({ editLanguages, setEditLanguages, c, styles, t }) {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const selectedLanguages = Array.isArray(editLanguages) ? editLanguages : [];
  const suggestions = q.length === 0 ? [] : languageOptions.filter((code) => {
    if (selectedLanguages.includes(code)) return false;
    return code.toLowerCase().includes(q) || getLangLabel(code).toLowerCase().includes(q);
  }).slice(0, 8);

  return (
    <View>
      {selectedLanguages.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selectedLanguages.map((code) => (
            <Pressable
              key={code}
              onPress={() => setEditLanguages((prev) => prev.filter((l) => l !== code))}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.primaryBg, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 9, minHeight: 36, gap: 4 }}
            >
              <Text style={{ color: c.primary, fontSize: 13 }}>{getLangLabel(code)}</Text>
              <Text style={{ color: c.primary, fontSize: 13 }}>×</Text>
            </Pressable>
          ))}
        </View>
      )}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={t('searchLanguagePlaceholder')}
        placeholderTextColor={c.muted}
        style={[styles.inputField, { color: c.text, borderColor: c.border, backgroundColor: c.mutedBg }]}
      />
      {suggestions.length > 0 && (
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: RADIUS.sm, marginTop: 4, overflow: 'hidden' }}>
          {suggestions.map((code) => (
            <Pressable
              key={code}
              onPress={() => { setEditLanguages((prev) => [...prev, code]); setSearch(''); }}
              style={{ paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border }}
            >
              <Text style={{ color: c.text, fontSize: 14 }}>{getLangLabel(code)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
