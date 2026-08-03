"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import {
  getBusinessProfile,
  getClient,
  updateBusinessProfile,
  updateClient,
} from "@/lib/api/profile";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type BusinessForm = {
  name: string;
  gstin: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  email: string;
  phone: string;
  hsnCode: string;
  panNumber: string;
};

type ClientForm = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
};

const EMPTY_BUSINESS: BusinessForm = {
  name: "",
  gstin: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  email: "",
  phone: "",
  hsnCode: "",
  panNumber: "",
};

const EMPTY_CLIENT: ClientForm = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  gstin: "",
};

function validate(business: BusinessForm, client: ClientForm): string | null {
  if (
    !business.name.trim() ||
    !business.line1.trim() ||
    !business.line2.trim() ||
    !business.city.trim() ||
    !business.state.trim() ||
    !business.pincode.trim() ||
    !business.country.trim() ||
    !business.email.trim() ||
    !business.phone.trim() ||
    !business.hsnCode.trim() ||
    !business.panNumber.trim()
  ) {
    return "Please fill in all business address fields.";
  }

  if (!GSTIN_REGEX.test(business.gstin.trim())) {
    return "Business GSTIN format is invalid.";
  }

  if (!EMAIL_REGEX.test(business.email.trim())) {
    return "Business email format is invalid.";
  }

  if (!PAN_REGEX.test(business.panNumber.trim())) {
    return "Business PAN format is invalid.";
  }

  if (
    !client.name.trim() ||
    !client.line1.trim() ||
    !client.line2.trim() ||
    !client.city.trim() ||
    !client.state.trim() ||
    !client.pincode.trim()
  ) {
    return "Please fill in all client address fields.";
  }

  if (!GSTIN_REGEX.test(client.gstin.trim())) {
    return "Client GSTIN format is invalid.";
  }

  return null;
}

export default function ProfilePage() {
  const [business, setBusiness] = useState<BusinessForm>(EMPTY_BUSINESS);
  const [client, setClient] = useState<ClientForm>(EMPTY_CLIENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [businessData, clientData] = await Promise.all([
          getBusinessProfile(),
          getClient(),
        ]);

        if (!cancelled) {
          setBusiness(businessData);
          setClient(clientData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load profile.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaveSuccess(false);

    const validationError = validate(business, client);

    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setSaveError(null);
    setSaving(true);

    try {
      const [businessData, clientData] = await Promise.all([
        updateBusinessProfile(business),
        updateClient(client),
      ]);

      setBusiness(businessData);
      setClient(clientData);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile &amp; Addresses
          </h1>
          <p className="text-muted-foreground">
            Manage business details and client billing addresses
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={loading || saving}
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saveError ? (
        <p className="text-sm text-destructive">{saveError}</p>
      ) : null}
      {saveSuccess ? (
        <p className="text-sm text-success">Changes saved.</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Business address</CardTitle>
          <CardDescription>Shown on every invoice you issue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="business-name">Business name</Label>
              <Input
                id="business-name"
                value={business.name}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="business-gstin">GSTIN</Label>
              <Input
                id="business-gstin"
                value={business.gstin}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    gstin: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="business-line1">Address line 1</Label>
              <Input
                id="business-line1"
                value={business.line1}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    line1: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="business-line2">Address line 2</Label>
              <Input
                id="business-line2"
                value={business.line2}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    line2: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-city">City</Label>
              <Input
                id="business-city"
                value={business.city}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    city: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-state">State</Label>
              <Input
                id="business-state"
                value={business.state}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    state: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-pincode">PIN code</Label>
              <Input
                id="business-pincode"
                value={business.pincode}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    pincode: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-country">Country</Label>
              <Input
                id="business-country"
                value={business.country}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    country: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-email">Email</Label>
              <Input
                id="business-email"
                type="email"
                value={business.email}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                value={business.phone}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-hsn-code">HSN code</Label>
              <Input
                id="business-hsn-code"
                value={business.hsnCode}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    hsnCode: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-pan-number">PAN number</Label>
              <Input
                id="business-pan-number"
                value={business.panNumber}
                disabled={loading}
                onChange={(event) =>
                  setBusiness((prev) => ({
                    ...prev,
                    panNumber: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client address</CardTitle>
          <CardDescription>
            Billing address used when generating invoices for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 rounded-xl border p-5">
            <div className="flex items-center gap-2.5">
              <Avatar
                src=""
                alt={client.name || "?"}
                shape="square"
                size="md"
              />
              <span className="text-sm font-semibold">
                {client.name || "Unnamed client"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="client-name">Client name</Label>
                <Input
                  id="client-name"
                  value={client.name}
                  disabled={loading}
                  onChange={(event) =>
                    setClient((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-line1">Address line 1</Label>
                <Input
                  id="client-line1"
                  value={client.line1}
                  disabled={loading}
                  onChange={(event) =>
                    setClient((prev) => ({
                      ...prev,
                      line1: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-line2">Address line 2</Label>
                <Input
                  id="client-line2"
                  value={client.line2}
                  disabled={loading}
                  onChange={(event) =>
                    setClient((prev) => ({
                      ...prev,
                      line2: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-city">City</Label>
                <Input
                  id="client-city"
                  value={client.city}
                  disabled={loading}
                  onChange={(event) =>
                    setClient((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-state">State</Label>
                <Input
                  id="client-state"
                  value={client.state}
                  disabled={loading}
                  onChange={(event) =>
                    setClient((prev) => ({
                      ...prev,
                      state: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-pincode">PIN code</Label>
                <Input
                  id="client-pincode"
                  value={client.pincode}
                  disabled={loading}
                  onChange={(event) =>
                    setClient((prev) => ({
                      ...prev,
                      pincode: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-gstin">GSTIN</Label>
                <Input
                  id="client-gstin"
                  value={client.gstin}
                  disabled={loading}
                  onChange={(event) =>
                    setClient((prev) => ({
                      ...prev,
                      gstin: event.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
