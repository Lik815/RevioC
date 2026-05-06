import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getBaseUrl, RADIUS, SHADOW, SPACE, TYPE } from './mobile-utils';

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
const TIME_WINDOWS = ['Morgens', 'Mittags', 'Abends'];

// ─── BookingRequestForm ────────────────────────────────────────────────────────

export function BookingRequestForm({ c, t, therapist, authToken, patientName, onSuccess, onClose }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleDay(day) {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  }

  function toggleTime(time) {
    setSelectedTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  }

  async function handleSubmit() {
    if (selectedDays.length === 0 || selectedTimes.length === 0) {
      setError('Bitte Wunschtage und Wunschzeit auswählen.');
      return;
    }
    if (!consent) {
      setError('Bitte stimme der Datenschutzerklärung zu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          therapistId: therapist.id,
          preferredDays: selectedDays.join(', '),
          preferredTimeWindows: selectedTimes.join(', '),
          message: message.trim() || undefined,
          consentAccepted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t('bookingRequestFail'));
      } else {
        onSuccess(data);
      }
    } catch {
      setError(t('bookingRequestFail'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: SPACE.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACE.lg }}>
        <Pressable onPress={onClose} style={{ marginRight: 12 }}>
          <Ionicons name="close" size={24} color={c.muted} />
        </Pressable>
        <Text style={{ ...TYPE.h2, color: c.text, flex: 1 }}>{t('bookingRequestTitle')}</Text>
      </View>

      {/* Therapist name */}
      <Text style={{ ...TYPE.caption, color: c.muted, marginBottom: SPACE.sm }}>
        {therapist.fullName} · {therapist.professionalTitle}
      </Text>

      {/* Days */}
      <Text style={{ ...TYPE.label, color: c.text, marginBottom: SPACE.xs }}>{t('bookingPreferredDays')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACE.md }}>
        {DAYS.map(day => {
          const active = selectedDays.includes(day);
          return (
            <Pressable
              key={day}
              onPress={() => toggleDay(day)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: RADIUS.sm,
                backgroundColor: active ? c.primary : c.mutedBg,
                borderWidth: 1,
                borderColor: active ? c.primary : c.border,
              }}
            >
              <Text style={{ ...TYPE.label, color: active ? '#fff' : c.text }}>{day}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Time windows */}
      <Text style={{ ...TYPE.label, color: c.text, marginBottom: SPACE.xs }}>{t('bookingPreferredTime')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACE.md }}>
        {TIME_WINDOWS.map(tw => {
          const active = selectedTimes.includes(tw);
          return (
            <Pressable
              key={tw}
              onPress={() => toggleTime(tw)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: RADIUS.sm,
                backgroundColor: active ? c.primary : c.mutedBg,
                borderWidth: 1,
                borderColor: active ? c.primary : c.border,
              }}
            >
              <Text style={{ ...TYPE.label, color: active ? '#fff' : c.text }}>{tw}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Message */}
      <Text style={{ ...TYPE.label, color: c.text, marginBottom: SPACE.xs }}>{t('bookingMessage')}</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder={t('bookingMessage')}
        placeholderTextColor={c.muted}
        multiline
        numberOfLines={3}
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: RADIUS.sm,
          backgroundColor: c.mutedBg,
          color: c.text,
          fontSize: 15,
          padding: 12,
          minHeight: 80,
          textAlignVertical: 'top',
          marginBottom: SPACE.md,
        }}
      />

      {/* Consent */}
      <Pressable
        onPress={() => setConsent(v => !v)}
        style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACE.md, gap: 10 }}
      >
        <View style={{
          width: 22, height: 22, borderRadius: 4,
          borderWidth: 1.5, borderColor: consent ? c.primary : c.border,
          backgroundColor: consent ? c.primary : 'transparent',
          alignItems: 'center', justifyContent: 'center', marginTop: 1,
        }}>
          {consent && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text style={{ ...TYPE.small, color: c.muted, flex: 1, lineHeight: 20 }}>{t('bookingConsent')}</Text>
      </Pressable>

      {/* Error */}
      {!!error && (
        <View style={{ backgroundColor: c.errorBg, borderRadius: RADIUS.sm, padding: 12, marginBottom: SPACE.sm, flexDirection: 'row', gap: 8 }}>
          <Ionicons name="alert-circle-outline" size={16} color={c.error} />
          <Text style={{ ...TYPE.small, color: c.error, flex: 1 }}>{error}</Text>
        </View>
      )}

      {/* Submit */}
      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? c.border : c.primary,
          borderRadius: RADIUS.md,
          paddingVertical: 16,
          alignItems: 'center',
        }}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={{ ...TYPE.label, color: '#fff', fontSize: 16 }}>{t('bookingRequestBtn')}</Text>
        }
      </Pressable>
    </ScrollView>
  );
}

// ─── PatientAppointmentCard ────────────────────────────────────────────────────

const STATUS_COLORS = {
  PENDING:   { bg: '#FFF9E6', text: '#B78700', label: 'Ausstehend' },
  CONFIRMED: { bg: '#E6F9EE', text: '#1A7A40', label: 'Bestätigt' },
  DECLINED:  { bg: '#FEF2F2', text: '#B91C1C', label: 'Abgelehnt' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280', label: 'Storniert' },
  EXPIRED:   { bg: '#F3F4F6', text: '#6B7280', label: 'Abgelaufen' },
};

export function PatientAppointmentCard({ c, t, appointment, onCancel, onViewTherapist }) {
  const { status, therapist, confirmedSlotAt, preferredDays, preferredTimeWindows } = appointment;
  const badge = STATUS_COLORS[status] ?? STATUS_COLORS.EXPIRED;

  return (
    <View style={{
      backgroundColor: c.card,
      borderRadius: RADIUS.md,
      padding: SPACE.md,
      marginBottom: SPACE.sm,
      ...SHADOW.card,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: c.primaryBg,
          alignItems: 'center', justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.primary }}>
            {(therapist?.fullName ?? '?')[0]}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ ...TYPE.label, color: c.text, fontSize: 15 }}>{therapist?.fullName ?? '—'}</Text>
          <Text style={{ ...TYPE.caption, color: c.muted, marginTop: 2 }}>{therapist?.professionalTitle ?? ''}</Text>
        </View>

        {/* Status badge */}
        <View style={{ backgroundColor: badge.bg, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: badge.text }}>{badge.label}</Text>
        </View>
      </View>

      {/* Confirmed slot */}
      {status === 'CONFIRMED' && confirmedSlotAt && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACE.sm, gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={c.primary} />
          <Text style={{ ...TYPE.small, color: c.primary, fontWeight: '600' }}>
            {new Date(confirmedSlotAt).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long' })}
          </Text>
        </View>
      )}

      {/* Preferred (when not confirmed) */}
      {status !== 'CONFIRMED' && (preferredDays || preferredTimeWindows) && (
        <Text style={{ ...TYPE.small, color: c.muted, marginTop: SPACE.xs }}>
          {[preferredDays, preferredTimeWindows].filter(Boolean).join(' · ')}
        </Text>
      )}

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: SPACE.sm }}>
        {status === 'PENDING' && (
          <Pressable
            onPress={() => Alert.alert(t('bookingCancelConfirm'), '', [
              { text: 'Nein', style: 'cancel' },
              { text: t('bookingCancel'), style: 'destructive', onPress: onCancel },
            ])}
            style={{ flex: 1, borderWidth: 1, borderColor: c.error, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ ...TYPE.label, color: c.error, fontSize: 14 }}>{t('bookingCancel')}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onViewTherapist}
          style={{ flex: 1, backgroundColor: c.mutedBg, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center' }}
        >
          <Text style={{ ...TYPE.label, color: c.text, fontSize: 14 }}>Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── TherapistBookingCard ──────────────────────────────────────────────────────

export function TherapistBookingCard({ c, t, request, onRespond }) {
  const [loading, setLoading] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [declinedReason, setDeclinedReason] = useState('');
  const [confirmDate, setConfirmDate] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  async function handleRespond(action) {
    setError('');
    if (action === 'CONFIRM' && !confirmDate.trim()) {
      setError('Bitte Datum eingeben (z.B. 15.05.2026 10:00)');
      return;
    }
    setLoading(true);
    try {
      let body;
      if (action === 'CONFIRM') {
        const parts = confirmDate.trim().split(/[\s,]+/);
        const [datePart, timePart] = parts;
        const [d, m, y] = datePart.split('.');
        const isoDate = timePart
          ? `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T${timePart}:00.000Z`
          : `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T09:00:00.000Z`;
        body = { action: 'CONFIRM', confirmedSlotAt: isoDate };
      } else {
        body = { action: 'DECLINE', declinedReason: declinedReason.trim() || undefined };
      }
      await onRespond(request.id, body);
    } catch {
      setError('Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  }

  const isPending = request.status === 'PENDING';

  return (
    <View style={{
      backgroundColor: c.card,
      borderRadius: RADIUS.md,
      padding: SPACE.md,
      marginBottom: SPACE.sm,
      ...SHADOW.card,
    }}>
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACE.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...TYPE.label, color: c.text, fontSize: 15 }}>{request.patientName}</Text>
          {request.patientEmail && (
            <Text style={{ ...TYPE.caption, color: c.muted, marginTop: 2 }}>{request.patientEmail}</Text>
          )}
        </View>
        {isPending && (
          <View style={{ backgroundColor: '#FFF9E6', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#B78700' }}>ANFRAGE</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <Text style={{ ...TYPE.small, color: c.muted, marginBottom: 2 }}>
        Wunschtage: {request.preferredDays || '—'}
      </Text>
      <Text style={{ ...TYPE.small, color: c.muted, marginBottom: request.message ? 4 : 0 }}>
        Wunschzeit: {request.preferredTimeWindows || '—'}
      </Text>
      {!!request.message && (
        <Text style={{ ...TYPE.small, color: c.text, fontStyle: 'italic', marginBottom: 4 }}>
          „{request.message}"
        </Text>
      )}

      {!isPending && (
        <Text style={{ ...TYPE.small, color: c.muted, marginTop: 4 }}>
          Status: {STATUS_COLORS[request.status]?.label ?? request.status}
        </Text>
      )}

      {/* Error */}
      {!!error && (
        <Text style={{ ...TYPE.small, color: c.error, marginTop: 6 }}>{error}</Text>
      )}

      {/* Confirm date input */}
      {isPending && showConfirm && (
        <TextInput
          value={confirmDate}
          onChangeText={setConfirmDate}
          placeholder="z.B. 15.05.2026 10:00"
          placeholderTextColor={c.muted}
          style={{
            borderWidth: 1, borderColor: c.border, borderRadius: RADIUS.sm,
            backgroundColor: c.mutedBg, color: c.text, fontSize: 14,
            padding: 10, marginTop: SPACE.sm,
          }}
        />
      )}

      {/* Decline reason input */}
      {isPending && showDecline && (
        <TextInput
          value={declinedReason}
          onChangeText={setDeclinedReason}
          placeholder="Grund (optional)"
          placeholderTextColor={c.muted}
          style={{
            borderWidth: 1, borderColor: c.border, borderRadius: RADIUS.sm,
            backgroundColor: c.mutedBg, color: c.text, fontSize: 14,
            padding: 10, marginTop: SPACE.sm,
          }}
        />
      )}

      {/* Action buttons */}
      {isPending && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: SPACE.sm }}>
          {/* Decline flow */}
          {!showConfirm && (
            showDecline ? (
              <Pressable
                disabled={loading}
                onPress={() => handleRespond('DECLINE')}
                style={{ flex: 1, borderWidth: 1, borderColor: c.error, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center' }}
              >
                {loading
                  ? <ActivityIndicator size="small" color={c.error} />
                  : <Text style={{ ...TYPE.label, color: c.error, fontSize: 14 }}>Senden</Text>
                }
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setShowDecline(true)}
                style={{ flex: 1, borderWidth: 1, borderColor: c.error, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ ...TYPE.label, color: c.error, fontSize: 14 }}>{t('bookingDeclineAction')}</Text>
              </Pressable>
            )
          )}

          {/* Confirm flow */}
          {!showDecline && (
            showConfirm ? (
              <Pressable
                disabled={loading}
                onPress={() => handleRespond('CONFIRM')}
                style={{ flex: 1, backgroundColor: c.primary, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center' }}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ ...TYPE.label, color: '#fff', fontSize: 14 }}>Bestätigen</Text>
                }
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setShowConfirm(true)}
                style={{ flex: 1, backgroundColor: c.primary, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ ...TYPE.label, color: '#fff', fontSize: 14 }}>{t('bookingConfirmAction')} →</Text>
              </Pressable>
            )
          )}
        </View>
      )}
    </View>
  );
}
